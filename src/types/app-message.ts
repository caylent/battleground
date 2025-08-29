import type { InferUITools, UIMessage } from 'ai';
import z from 'zod';
import type { tools } from '@/tools';

const metadataSchema = z.object({
  someMetadata: z.string().datetime(),
});

type MyMetadata = z.infer<typeof metadataSchema>;

const dataPartSchema = z.object({});

type MyDataPart = z.infer<typeof dataPartSchema>;

type MyTools = InferUITools<typeof tools>;

export type MyUIMessage = UIMessage<MyMetadata, MyDataPart, MyTools>;
