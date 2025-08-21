import { bedrock } from '@ai-sdk/amazon-bedrock';
import { experimental_generateImage as generateImage, tool } from 'ai';
import z from 'zod';
import { uploadImageFromBase64 } from '../lib/s3-utils';

export const ImageGenerationTool = tool({
  name: 'image_generation',
  description: 'Generate an image',
  inputSchema: z.object({
    prompt: z.string(),
  }),
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

    try {
      // Upload the generated image to S3 and return the S3 URL
      const url = await uploadImageFromBase64(
        userId,
        image.base64,
        image.mediaType
      );

      console.log('url', url);

      return { url };
    } catch (error) {
      console.error('Failed to upload image to S3:', error);
      // Fallback to original URL if S3 upload fails
      return image;
    }
  },
});
