import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { openai } from '@ai-sdk/openai';
import { auth } from '@clerk/nextjs/server';
import {
  extractReasoningMiddleware,
  stepCountIs,
  streamText,
  wrapLanguageModel,
} from 'ai';
import { fetchQuery } from 'convex/nextjs';
import type { NextRequest } from 'next/server';
import { convertToModelMessageWithAttachments } from '@/lib/convert-to-model-messages';
import { getRequestCost } from '@/lib/model/get-request-cost';
import { textModels } from '@/lib/model/models';
import { rateLimit } from '@/lib/rate-limiter';
import { uploadAttachments } from '@/lib/upload-attachments';
import { tools } from '@/tools';
import type { MyUIMessage } from '@/types/app-message';
import { api } from '../../../../convex/_generated/api';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  await rateLimit();

  const { chatId, messages } = (await req.json()) as {
    chatId: string;
    messages: MyUIMessage[];
  };

  const lastMessage = messages.at(-1);

  if (!lastMessage) {
    return new Response('No message found', { status: 400 });
  }

  const updatedMessage = await uploadAttachments(userId, lastMessage);

  try {
    const updatedMessages = [...messages.slice(0, -1), updatedMessage];

    const battle = await fetchQuery(api.battle.getByUserId, { userId });

    if (!battle) {
      return new Response('Battle not found', { status: 404 });
    }

    const chat = battle.chats.find((c) => c.id === chatId);

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    const modelInfo = textModels.find((m) => m.id === chat.model.id);

    const thinkingMiddleware = extractReasoningMiddleware({
      tagName: 'thinking',
    });

    const model = wrapLanguageModel({
      model:
        modelInfo?.provider === 'OpenAI'
          ? openai(modelInfo?.id ?? '')
          : createAmazonBedrock({
              region: modelInfo?.region ?? 'us-east-1',
            })(modelInfo?.id ?? ''),
      middleware: [thinkingMiddleware],
    });

    const start = Date.now();

    const result = streamText({
      model,
      system:
        'You are a helpful assistant. You have access to the following tools (only use them when necessary): ' +
        Object.keys(tools).join(', '),
      messages: await convertToModelMessageWithAttachments(
        userId,
        updatedMessages
      ),
      activeTools: (chat.model.settings?.activeTools as any) ?? [],
      tools: modelInfo?.capabilities?.includes('TOOL_STREAMING')
        ? tools
        : undefined,
      stopWhen: stepCountIs(5),
      experimental_context: { userId },
    });

    return result.toUIMessageStreamResponse<MyUIMessage>({
      messageMetadata: ({ part }) => {
        if (part.type === 'start') {
          const ttft = Date.now() - start;
          return { modelId: chat.model.id, ttft };
        }
        if (part.type === 'reasoning-end') {
          const reasoningTime = Date.now() - start;
          return { reasoningTime };
        }
        if (part.type === 'error') {
          if (typeof part.error === 'string') {
            return { error: part.error };
          }
          if (part.error instanceof Error) {
            return { error: part.error.message };
          }
        }
        if (part.type === 'finish') {
          const totalResponseTime = Date.now() - start;
          return {
            totalResponseTime,
            cost: getRequestCost({
              modelId: chat.model.id,
              inputTokens: part.totalUsage.inputTokens ?? 0,
              outputTokens: part.totalUsage.outputTokens ?? 0,
            }),
            ...part.totalUsage,
          };
        }
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
