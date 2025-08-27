import type { FileUIPart, UIMessage } from 'ai';
import { uploadImageFromBase64 } from './s3-utils';

// Move regex to top level for performance
const CONTENT_TYPE_REGEX = /data:([^;]+)/;

export function parseDataUrl(dataUrl: string) {
  if (dataUrl.startsWith('https://')) {
    return { contentType: 'image/png', base64Data: dataUrl };
  }

  if (!dataUrl.startsWith('data:')) {
    throw new Error('Invalid data URL format');
  }

  const [header, base64Data] = dataUrl.split(',');
  const contentType =
    header.match(CONTENT_TYPE_REGEX)?.[1] || 'application/octet-stream';

  if (!base64Data) {
    throw new Error('No base64 data found in data URL');
  }

  return { contentType, base64Data };
}

export async function uploadAttachments(
  userId: string,
  message: UIMessage
): Promise<UIMessage> {
  const updatedMessage: UIMessage = {
    ...message,
    parts: [],
  };
  for (const part of message.parts) {
    if (part.type === 'file') {
      // If it's already a URL, keep it as is
      if (!part.url.startsWith('data:')) {
        updatedMessage.parts.push(part);
        continue;
      }

      try {
        const { contentType, base64Data } = parseDataUrl(part.url);

        const url = await uploadImageFromBase64(
          userId,
          base64Data,
          contentType
        );

        updatedMessage.parts.push({
          type: 'file',
          url,
          mediaType: contentType,
        } satisfies FileUIPart);
      } catch (error) {
        const filename = part.filename || 'uploaded-file';
        throw new Error(
          `Failed to upload file ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    } else {
      updatedMessage.parts.push(part);
    }
  }

  return updatedMessage;
}
