import type { InferUITools, UIMessage } from 'ai';
import z from 'zod';
import type { tools } from '@/tools';

const metadataSchema = z.object({
  modelId: z.string(),
  ttft: z.number(),
  totalResponseTime: z.number(),
  cost: z.number().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  reasoningTokens: z.number().optional(),
  cachedInputTokens: z.number().optional(),
});

export type MyMetadata = z.infer<typeof metadataSchema>;

const dataPartSchema = z.object({});

type MyDataPart = z.infer<typeof dataPartSchema>;

type MyTools = InferUITools<typeof tools>;

export type MyUIMessage = UIMessage<MyMetadata, MyDataPart, MyTools>;
