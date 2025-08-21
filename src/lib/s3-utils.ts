import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'bedrock-playground-images';

// Regex to remove data URL prefix from base64 strings
const DATA_URL_PREFIX_REGEX = /^data:image\/[a-z]+;base64,/;

export function generateImageName() {
  return `${nanoid()}-${Date.now()}.png`;
}

export async function uploadImageToS3(
  key: string,
  imageData: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: imageData,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);

    // Return the public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
}

export async function uploadImageFromBase64(
  userId: string,
  base64Data: string,
  contentType = 'image/png'
): Promise<string> {
  try {
    const imageName = generateImageName();

    const key = `user/${userId}/${imageName}`;

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64String = base64Data.replace(DATA_URL_PREFIX_REGEX, '');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64String, 'base64');

    await uploadImageToS3(key, imageBuffer, contentType);

    // this URL will be a proxy to the image in S3
    return `attachments/${imageName}`;
  } catch (error) {
    console.error('Error uploading image from base64 to S3:', error);
    throw new Error('Failed to upload image from base64 to S3');
  }
}

export async function getImageFromS3(userId: string, imageId: string) {
  try {
    if (!imageId) {
      throw new Error('Missing id parameter');
    }

    // Get the object from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `user/${userId}/${imageId}`,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('Image not found');
    }

    // Convert the stream to a buffer
    const buffer = Buffer.from(await response.Body.transformToByteArray());

    return {
      buffer,
      contentType: response.ContentType || 'image/png',
      contentLength: buffer.length,
    };
  } catch (error) {
    console.error('Error retrieving image from S3:', error);

    // Re-throw with more specific error types
    if (error instanceof Error) {
      if (error.name === 'NoSuchKey') {
        throw new Error('Image not found');
      }
      if (error.message === 'Missing key parameter') {
        throw error;
      }
    }

    throw new Error('Failed to retrieve image from S3');
  }
}
