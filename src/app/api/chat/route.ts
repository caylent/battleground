import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { auth } from '@clerk/nextjs/server';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import type { NextRequest } from 'next/server';
import { getRequestCost } from '@/lib/model/get-request-cost';
import type { TextModelId } from '@/lib/model/model.type';
import { textModels } from '@/lib/model/models';
import { externalRateLimiter, internalRateLimiter } from '@/lib/rate-limiter';
import { tools } from '@/tools';

const internalRateLimitDomain = process.env.INTERNAL_RATE_LIMIT_DOMAIN;

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();

  if (!sessionClaims?.email) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  const email = sessionClaims.email as string;

  // If the user is from the internal rate limit domain, we use a different rate limiter
  if (internalRateLimitDomain && email.endsWith(internalRateLimitDomain)) {
    const { success } = await internalRateLimiter.limit(email);
    if (!success) {
      return new Response(JSON.stringify({ message: 'Too many requests' }), {
        status: 429,
      });
    }
  } else {
    const { success } = await externalRateLimiter.limit(email);
    if (!success) {
      return new Response(JSON.stringify({ message: 'Too many requests' }), {
        status: 429,
      });
    }
  }

  const { modelId, messages, systemPrompt, maxTokens, temperature } =
    (await req.json()) as {
      modelId: TextModelId;
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
      messages: UIMessage[];
    };

  const modelInfo = textModels.find((m) => m.id === modelId);

  try {
    const model = createAmazonBedrock({
      region: modelInfo?.region ?? 'us-east-1',
    })(modelId);

    let firstTokenTime: number = Number.NaN;
    const start = Date.now();

    const result = streamText({
      model,
      system:
        modelInfo?.capabilities?.includes('SYSTEM_PROMPT') && !!systemPrompt
          ? systemPrompt
          : undefined,
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(5),
      maxOutputTokens: maxTokens,
      temperature,
      experimental_context: { userId },
      onChunk: () => {
        if (!firstTokenTime) {
          firstTokenTime = Date.now() - start;
        }
      },
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return {
            modelId,
            firstTokenTime,
            cost: getRequestCost({
              modelId,
              inputTokens: part.totalUsage.inputTokens ?? 0,
              outputTokens: part.totalUsage.outputTokens ?? 0,
            }),
          };
        }
      },
    });
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      { status: err.httpStatusCode }
    );
  }
}
