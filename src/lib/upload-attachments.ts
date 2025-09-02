import type { FileUIPart } from 'ai';
import type { MyUIMessage } from '@/types/app-message';
import { uploadFileFromBuffer } from './s3-utils';

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
  message: MyUIMessage
): Promise<MyUIMessage> {
  const updatedMessage: MyUIMessage = {
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

        console.log('uploading data url to s3', {
          ...part,
          url: part.url.slice(0, 20),
        });

        const { fileName } = await uploadFileFromBuffer(
          userId,
          Buffer.from(base64Data, 'base64'),
          contentType,
          part.filename
        );

        updatedMessage.parts.push({
          type: 'file',
          url: `/api/attachments?filename=${fileName}`,
          filename: fileName,
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
