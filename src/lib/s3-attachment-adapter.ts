import type {
  AttachmentAdapter,
  CompleteAttachment,
  PendingAttachment,
} from '@assistant-ui/react';

export class S3AttachmentAdapter implements AttachmentAdapter {
  accept = '*/*';

  add(state: { file: File }): Promise<PendingAttachment> {
    // Determine attachment type based on file type
    const isImage = state.file.type.startsWith('image/');
    const attachmentType = isImage ? 'image' : 'file';

    return Promise.resolve({
      id: state.file.name,
      type: attachmentType,
      name: state.file.name,
      contentType: state.file.type,
      file: state.file,
      status: { type: 'requires-action', reason: 'composer-send' },
    });
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    try {
      // Upload file to S3 via API
      const formData = new FormData();
      formData.append('file', attachment.file);

      const response = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = (await response.json()) as {
        url: string;
        filename: string;
        type: string;
      };

      const isImage = attachment.contentType?.startsWith('image/');

      return {
        id: attachment.id,
        type: 'image',
        name: result.filename,
        contentType: result.type,
        status: { type: 'complete' },
        file: attachment.file,
        content: isImage
          ? [
              {
                type: 'file',
                data: result.url,
                mimeType: attachment.contentType,
                filename: result.filename,
              } as any,
            ]
          : [
              {
                type: 'text',
                text: `File uploaded: ${attachment.name} (${result.url})`,
              },
            ],
      };
    } catch (error) {
      console.error('File upload failed:', error);

      // Fallback to data URL if upload fails (only for images)
      const isImage = attachment.contentType?.startsWith('image/');

      if (isImage) {
        return {
          ...attachment,
          status: { type: 'complete' },
          content: [
            {
              type: 'image',
              image: await getFileDataURL(attachment.file),
            },
          ],
        };
      }

      // For non-images, return failed status
      return {
        ...attachment,
        status: { type: 'complete' },
        content: [
          {
            type: 'text',
            text: `Failed to upload file: ${attachment.name}`,
          },
        ],
      };
    }
  }

  async remove() {
    // noop
  }
}

const getFileDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
