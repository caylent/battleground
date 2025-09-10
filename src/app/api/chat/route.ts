import {
  type BedrockProviderOptions,
  createAmazonBedrock,
} from '@ai-sdk/amazon-bedrock';
import { openai } from '@ai-sdk/openai';
import { auth } from '@clerk/nextjs/server';
import {
  createIdGenerator,
  extractReasoningMiddleware,
  generateId,
  stepCountIs,
  streamText,
  wrapLanguageModel,
} from 'ai';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import type { NextRequest } from 'next/server';
import { after } from 'next/server';
import { createResumableStreamContext } from 'resumable-stream';
import { convertToModelMessageWithAttachments } from '@/lib/convert-to-model-messages';
import { generateChatName } from '@/lib/generate-chat-name';
import { getRequestCost } from '@/lib/model/get-request-cost';
import { rateLimit } from '@/lib/rate-limiter';
import { uploadAttachments } from '@/lib/upload-attachments';
import { tools } from '@/tools';
import type { MyUIMessage } from '@/types/app-message';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  await rateLimit();

  const {
    id,
    message,
    trigger = 'submit-message',
  } = (await req.json()) as {
    id: Id<'chats'>;
    message: MyUIMessage;
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

    const middleware = extractReasoningMiddleware({
      tagName: 'thinking',
    });

    const model = wrapLanguageModel({
      model:
        chat.model?.provider === 'OpenAI'
          ? openai(chat.model?.id ?? '')
          : createAmazonBedrock({
              region: chat.model?.region ?? 'us-east-1',
            })(chat.model?.id ?? ''),
      middleware,
    });

    const start = Date.now();

    const result = streamText({
      model,
      system: chat.model?.settings?.systemPrompt,
      messages: await convertToModelMessageWithAttachments(userId, messages),
      activeTools: (chat.model?.settings?.activeTools as any) ?? [],
      tools: chat.model?.capabilities?.includes('TOOL_STREAMING')
        ? tools
        : undefined,
      stopWhen: stepCountIs(5),
      maxOutputTokens: chat.model?.settings?.maxTokens,
      temperature: chat.model?.settings?.temperature,
      experimental_context: { userId },
      experimental_telemetry: {
        isEnabled: true,
      },
      providerOptions: {
        bedrock: {
          reasoningConfig: { type: 'enabled', budgetTokens: 1024 },
        } satisfies BedrockProviderOptions,
      },
    });

    return result.toUIMessageStreamResponse<MyUIMessage>({
      originalMessages: messages,
      generateMessageId: createIdGenerator({
        prefix: 'msg',
        size: 16,
      }),
      messageMetadata: ({ part }) => {
        if (part.type === 'start') {
          const ttft = Date.now() - start;
          return {
            modelId: chat.model?.id ?? '',
            ttft,
          };
        }
        if (part.type === 'reasoning-end') {
          const reasoningTime = Date.now() - start;
          return {
            reasoningTime,
          };
        }
        if (part.type === 'error') {
          if (typeof part.error === 'string') {
            return {
              error: part.error,
            };
          }
          if (part.error instanceof Error) {
            return {
              error: part.error.message,
            };
          }
        }
        if (part.type === 'finish') {
          const totalResponseTime = Date.now() - start;
          return {
            totalResponseTime,
            cost: getRequestCost({
              modelId: chat.model?.id ?? '',
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
          activeStreamId: '',
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
