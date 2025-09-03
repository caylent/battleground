import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { auth } from '@clerk/nextjs/server';
import { createIdGenerator, generateId, stepCountIs, streamText } from 'ai';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import type { NextRequest } from 'next/server';
import { after } from 'next/server';
import { createResumableStreamContext } from 'resumable-stream';
import { convertToModelMessageWithAttachments } from '@/lib/convert-to-model-messages';
import { generateChatName } from '@/lib/generate-chat-name';
import { getRequestCost } from '@/lib/model/get-request-cost';
import { textModels } from '@/lib/model/models';
import { rateLimit } from '@/lib/rate-limiter';
import { uploadAttachments } from '@/lib/upload-attachments';
import { tools } from '@/tools';
import type { MyUIMessage } from '@/types/app-message';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';

// const redis = await createClient({ url: process.env.REDIS_URL }).connect();

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  await rateLimit();

  const {
    id,
    modelId = 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    message,
    maxTokens,
    temperature,
    trigger = 'submit-message',
  } = (await req.json()) as {
    id: Id<'chats'>;
    message: MyUIMessage;
    modelId?: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    trigger?: 'submit-message' | 'regenerate-message';
  };

  if (!message) {
    return new Response('No message found', { status: 400 });
  }

  const updatedMessage = await uploadAttachments(userId, message);

  let messages: MyUIMessage[] = [updatedMessage];

  try {
    const chat = await fetchQuery(api.chats.getById, { id });

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (trigger === 'regenerate-message') {
      const lastMessageIndex = (chat.messages ?? []).findIndex(
        (msg) => msg.id === updatedMessage.id
      );

      if (lastMessageIndex === -1) {
        throw new Error('Message to regenerate not found');
      }
      // Keep all messages up to and including the one to regenerate, remove everything after
      messages = (chat.messages ?? []).slice(0, lastMessageIndex + 1);
    } else {
      messages = [...(chat?.messages ?? []), updatedMessage];
    }

    let chatName: string | undefined;
    if (messages.length === 1) {
      chatName = await generateChatName(userId, messages[0]);
    }

    await fetchMutation(api.chats.update, {
      id,
      activeStreamId: '',
      messages,
      name: chatName,
    });

    const modelInfo = textModels.find((m) => m.id === modelId);

    const model = createAmazonBedrock({
      region: modelInfo?.region ?? 'us-east-1',
    })(modelId);

    let ttft: number = Number.NaN;
    let totalResponseTime: number = Number.NaN;
    const start = Date.now();

    const result = streamText({
      model,
      system:
        'You are a helpful assistant. You have access to the following tools (only use them when necessary): ' +
        Object.keys(tools).join(', '),
      messages: await convertToModelMessageWithAttachments(userId, messages),
      tools,
      stopWhen: stepCountIs(5),
      maxOutputTokens: maxTokens,
      temperature,
      experimental_context: { userId },
      onChunk: () => {
        if (!ttft) {
          ttft = Date.now() - start;
        }
      },
      onFinish: () => {
        totalResponseTime = Date.now() - start;
      },
    });

    return result.toUIMessageStreamResponse<MyUIMessage>({
      originalMessages: messages,
      generateMessageId: createIdGenerator({
        prefix: 'msg',
        size: 16,
      }),
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return {
            modelId,
            ttft,
            totalResponseTime,
            cost: getRequestCost({
              modelId,
              inputTokens: part.totalUsage.inputTokens ?? 0,
              outputTokens: part.totalUsage.outputTokens ?? 0,
            }),
            ...part.totalUsage,
          };
        }
      },
      onFinish: async ({ messages: newMessages }) => {
        await fetchMutation(api.chats.update, {
          id,
          messages: newMessages,
        });
      },
      async consumeSseStream({ stream }) {
        const streamId = generateId();

        // Create a resumable stream from the SSE stream
        const streamContext = createResumableStreamContext({
          waitUntil: after,
        });
        await streamContext.createNewResumableStream(streamId, () => stream);

        // Update the chat with the active stream ID
        await fetchMutation(api.chats.update, {
          id,
          activeStreamId: streamId,
        });
      },
    });
  } catch (err: any) {
    console.error(err);
    return Response.json(
      { message: err.message },
      { status: err.httpStatusCode }
    );
  }
}
