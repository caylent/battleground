import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateObject, type UIMessage } from 'ai';
import { z } from 'zod';
import { convertToModelMessageWithAttachments } from './convert-to-model-messages';

export const generateChatName = async (userId: string, message: UIMessage) => {
  const result = await generateObject({
    model: bedrock('us.anthropic.claude-sonnet-4-20250514-v1:0'),
    schema: z.object({
      name: z.string(),
    }),
    system:
      'Generate a short and concise name for a chat based on the user message.',
    prompt: await convertToModelMessageWithAttachments(userId, [message]),
  });

  return result.object.name;
};
