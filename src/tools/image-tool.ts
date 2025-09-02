import { bedrock } from '@ai-sdk/amazon-bedrock';
import { experimental_generateImage as generateImage, tool } from 'ai';
import z from 'zod';
import { uploadFileFromBuffer } from '../lib/s3-utils';

const inputSchema = z.object({
  prompt: z.string(),
});

export type ImageGenerationToolInput = z.infer<typeof inputSchema>;

const outputSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
});

export type ImageGenerationToolOutput = z.infer<typeof outputSchema>;

export const ImageGenerationTool = tool({
  name: 'image_generation',
  description: 'Generate an image',
  inputSchema,
  outputSchema,
  execute: async ({ prompt }, { experimental_context }) => {
    const { userId } = experimental_context as { userId: string };

    const response = await generateImage({
      model: bedrock.image('amazon.nova-canvas-v1:0'),
      prompt,
    });

    const image = response.images[0];

    if (!image?.base64) {
      throw new Error('No image data returned from generation');
    }

    return await uploadFileFromBuffer(
      userId,
      Buffer.from(image.base64, 'base64'),
      image.mediaType
    );
  },
});
