import { convertAiMessagesToCoreMessages } from "@/lib/convert-messages-to-core-messages";
import { getRequestCost } from "@/lib/model/get-request-cost";
import { TextModelConfig } from "@/lib/model/model-configs";
import { TextModelId } from "@/lib/model/model.type";
import { textModels } from "@/lib/model/models";
import { externalRateLimiter, internalRateLimiter } from "@/lib/rate-limiter";
import { ResponseMetrics } from "@/types/response-metrics.type";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { createDataStreamResponse, Message, streamText } from "ai";
import { NextRequest } from "next/server";

const internalRateLimitDomain = process.env.INTERNAL_RATE_LIMIT_DOMAIN;

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();

  if (!sessionClaims?.email) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  // If the user is from the internal rate limit domain, we use a different rate limiter
  if (internalRateLimitDomain && sessionClaims?.email?.endsWith(internalRateLimitDomain)) {
    const { success } = await internalRateLimiter.limit(sessionClaims.email);
    if (!success) {
      return new Response(JSON.stringify({ message: "Too many requests" }), { status: 429 });
    }
  } else {
    const { success } = await externalRateLimiter.limit(sessionClaims.email);
    if (!success) {
      return new Response(JSON.stringify({ message: "Too many requests" }), { status: 429 });
    }
  }

  const { modelId, messages, config } = (await req.json()) as {
    modelId: TextModelId;
    messages: Message[];
    config?: TextModelConfig;
  };

  const modelInfo = textModels.find((m) => m.id === modelId);

  try {
    const model =
      modelInfo?.provider === "Nvidia"
        ? createOpenAI({
            baseURL: "https://integrate.api.nvidia.com/v1",
            apiKey: process.env.NVIDIA_NIM_API_KEY ?? "",
          })(modelId)
        : modelInfo?.provider === "OpenAI"
          ? createOpenAI({
              compatibility: "strict",
              apiKey: process.env.OPENAI_API_KEY ?? "",
            })(modelId)
          : createAmazonBedrock({
              region: modelInfo?.region ?? "us-east-1",
            })(modelId);

    let firstTokenTime: number = NaN;
    const start = Date.now();

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model,
          system: modelInfo?.systemPromptSupport && !!config?.systemPrompt ? config.systemPrompt : undefined,
          messages: convertAiMessagesToCoreMessages(messages),
          maxTokens: config?.maxTokens.value,
          temperature: config?.temperature.value,
          headers: {
            "user-agent": "node",
          },
          providerOptions: {
            bedrock: config?.reasoning?.enabled
              ? {
                  reasoning_config: { type: "enabled", budget_tokens: config.reasoning.budgetTokens.value },
                }
              : {},
          },
          onChunk: () => {
            if (!firstTokenTime) {
              firstTokenTime = Date.now() - start;
            }
          },
          onFinish: (e) => {
            const inputTokens = e.usage.promptTokens ?? NaN;
            const outputTokens = e.usage.completionTokens ?? NaN;
            dataStream.writeMessageAnnotation({
              firstTokenTime,
              responseTime: Date.now() - start,
              inputTokens,
              outputTokens,
              cost: getRequestCost({ modelId, inputTokens, outputTokens }),
            } satisfies ResponseMetrics);
          },
        });

        result.mergeIntoDataStream(dataStream, { sendReasoning: true });
      },
      onError: (err) => {
        console.error("ERROR", JSON.stringify(err, null, 2));
        return "error";
      },
    });
  } catch (err: any) {
    console.error("ERROR", err);
    return Response.json({ message: err.message }, { status: err.httpStatusCode ?? 500 });
  }
}
