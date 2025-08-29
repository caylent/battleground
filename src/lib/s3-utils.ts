import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'missing-bucket-name';

export function generateFileName(contentType?: string) {
  const timestamp = Date.now();
  const id = nanoid();

  const extensions: Record<string, string> = {
    'text/plain': '.txt',
    'text/markdown': '.md',
    'text/csv': '.csv',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'application/json': '.json',
    'application/xml': '.xml',
    'application/javascript': '.js',
    'application/typescript': '.ts',
    'application/x-python': '.py',
    'application/x-sh': '.sh',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  };

  const extension = contentType ? extensions[contentType] || '.txt' : '.txt';
  return `${id}-${timestamp}${extension}`;
}

export async function uploadFileToS3(
  key: string,
  fileData: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileData,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);

    // Return the public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

export async function uploadFileFromBuffer(
  userId: string,
  fileBuffer: Buffer,
  contentType: string,
  originalName?: string
): Promise<{ fileName: string; contentType: string }> {
  try {
    const fileName = originalName ?? generateFileName(contentType);
    const key = `user/${userId}/${fileName}`;

    await uploadFileToS3(key, fileBuffer, contentType);

    return {
      fileName,
      contentType,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

export async function generatePresignedUrl(
  userId: string,
  fileName: string,
  expiresIn = 24 * 3600 // 24 hours default
): Promise<string> {
  try {
    const key = `user/${userId}/${fileName}`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

export async function getFileFromS3(
  userId: string,
  fileName: string
): Promise<{ data: Uint8Array; contentType: string; contentLength: number }> {
  try {
    const key = `user/${userId}/${fileName}`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('File not found');
    }

    // Convert the stream to a Uint8Array
    const data = await response.Body.transformToByteArray();

    return {
      data,
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: response.ContentLength || data.length,
    };
  } catch (error) {
    console.error('Error retrieving file from S3:', error);
    throw new Error('Failed to retrieve file from S3');
  }
}
