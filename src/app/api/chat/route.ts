import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { auth } from '@clerk/nextjs/server';
import {
  convertToModelMessages,
  createIdGenerator,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import type { NextRequest } from 'next/server';
import { getRequestCost } from '@/lib/model/get-request-cost';
import type { TextModelId } from '@/lib/model/model.type';
import { textModels } from '@/lib/model/models';
import { rateLimit } from '@/lib/rate-limiter';
import { uploadAttachments } from '@/lib/upload-attachments';
import { tools } from '@/tools';
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
    modelId = 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    message,
    maxTokens,
    temperature,
  } = (await req.json()) as {
    id: Id<'chats'>;
    modelId?: TextModelId;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    message: UIMessage;
  };

  if (!message) {
    return new Response('No message found', { status: 400 });
  }

  const updatedMessage = await uploadAttachments(userId, message);

  let messages: UIMessage[] = [updatedMessage];

  try {
    const chat = await fetchQuery(api.chats.getById, { id });

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    messages = [...(chat?.messages ?? []), message];

    await fetchMutation(api.chats.updateStatus, {
      id,
      status: 'in-progress',
    });

    const modelInfo = textModels.find((m) => m.id === modelId);

    const model = createAmazonBedrock({
      region: modelInfo?.region ?? 'us-east-1',
    })(modelId);

    let ttft: number = Number.NaN;
    const start = Date.now();

    const result = streamText({
      model,
      system:
        'You are a helpful assistant. You have access to the following tools (only use them when necessary): ' +
        Object.keys(tools).join(', '),
      messages: convertToModelMessages(messages),
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
    });

    result.consumeStream(); // no await

    return result.toUIMessageStreamResponse({
      originalMessages: [...(chat?.messages ?? []), updatedMessage],
      generateMessageId: createIdGenerator({
        prefix: 'msg',
        size: 16,
      }),
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return {
            modelId,
            ttft,
            cost: getRequestCost({
              modelId,
              inputTokens: part.totalUsage.inputTokens ?? 0,
              outputTokens: part.totalUsage.outputTokens ?? 0,
            }),
          };
        }
      },
      onFinish: async ({ messages: newMessages }) => {
        await fetchMutation(api.chats.updateMessages, {
          id,
          messages: newMessages,
        });
      },
    });
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      { status: err.httpStatusCode }
    );
  }
}

// export async function GET(request: Request) {
//   const streamContext = createResumableStreamContext({
//     waitUntil: after,
//     publisher: kv,
//     subscriber: kv,
//   });

//   const { searchParams } = new URL(request.url);
//   const chatId = searchParams.get('chatId');

//   if (!chatId) {
//     return new Response('id is required', { status: 400 });
//   }

//   const streamIds = await kv.get<string[]>(`streamIds:${chatId}`);

//   if (!streamIds?.length) {
//     return new Response('No streams found', { status: 404 });
//   }

//   const recentStreamId = streamIds.at(-1);

//   if (!recentStreamId) {
//     return new Response('No recent stream found', { status: 404 });
//   }

//   const emptyDataStream = createUIMessageStream({
//     // biome-ignore lint/suspicious/noEmptyBlockStatements: Empty stream
//     execute: () => {},
//   });

//   return new Response(
//     await streamContext.resumableStream(recentStreamId, () =>
//       emptyDataStream.pipeThrough(new JsonToSseTransformStream())
//     )
//   );
// }
