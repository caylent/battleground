import { convertToModelMessages, type FileUIPart, type UIMessage } from 'ai';
import { getFileFromS3 } from './s3-utils';

export const convertToModelMessageWithAttachments = async (
  userId: string,
  messages: UIMessage[]
) => {
  const messagesWithDataUrls = await Promise.all(
    messages.map(async (message) => {
      const parts = await Promise.all(
        message.parts.map(async (part) => {
          if (part.type === 'file') {
            if (!part.filename) {
              throw new Error('File has no filename');
            }

            const file = await getFileFromS3(userId, part.filename);

            if (!file) {
              throw new Error('File not found');
            }

            const base64Data = Buffer.from(file.data).toString('base64');

            const dataUrl = `data:${part.mediaType};base64,${base64Data}`;

            return {
              ...part,
              url: dataUrl,
            } as FileUIPart;
          }
          return part;
        })
      );

      return {
        ...message,
        parts,
      };
    })
  );

  return convertToModelMessages(messagesWithDataUrls);
};
