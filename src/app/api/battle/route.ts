import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { auth } from '@clerk/nextjs/server';
import { stepCountIs, streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { convertToModelMessageWithAttachments } from '@/lib/convert-to-model-messages';
import { getRequestCost } from '@/lib/model/get-request-cost';
import { DEFAULT_TEXT_MODEL, DEFAULT_TEXT_MODEL_ID } from '@/lib/model/models';
import { rateLimit } from '@/lib/rate-limiter';
import { uploadAttachments } from '@/lib/upload-attachments';
import { tools } from '@/tools';
import type { MyUIMessage } from '@/types/app-message';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  await rateLimit();

  const { messages } = (await req.json()) as {
    messages: MyUIMessage[];
  };

  const lastMessage = messages.at(-1);

  if (!lastMessage) {
    return new Response('No message found', { status: 400 });
  }

  const updatedMessage = await uploadAttachments(userId, lastMessage);

  try {
    const updatedMessages = [...messages.slice(0, -1), updatedMessage];

    const modelInfo = DEFAULT_TEXT_MODEL;

    const model = createAmazonBedrock({
      region: modelInfo?.region ?? 'us-east-1',
    })(DEFAULT_TEXT_MODEL_ID);

    let ttft: number = Number.NaN;
    let totalResponseTime: number = Number.NaN;
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
      tools,
      stopWhen: stepCountIs(5),
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
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return {
            modelId: DEFAULT_TEXT_MODEL_ID,
            ttft,
            totalResponseTime,
            cost: getRequestCost({
              modelId: DEFAULT_TEXT_MODEL_ID,
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
