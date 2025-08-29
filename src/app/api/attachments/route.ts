import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { getFileFromS3, uploadFileFromBuffer } from '@/lib/s3-utils';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  // Image types
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Text types
  'text/plain',
  'text/markdown',
  'text/csv',
  'text/html',
  'text/css',
  'text/javascript',
  'text/xml',
  // Document types
  'application/json',
  'application/xml',
  'application/javascript',
  'application/typescript',
  // Code files
  'application/x-python',
  'application/x-sh',
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    try {
      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(buffer);

      // Upload to S3
      const uploadResult = await uploadFileFromBuffer(
        userId,
        fileBuffer,
        file.type,
        file.name
      );

      return NextResponse.json({
        success: true,
        filename: uploadResult.fileName,
        size: file.size,
        type: uploadResult.contentType,
      });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get filename from query parameters
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename parameter is required' },
        { status: 400 }
      );
    }

    try {
      // Retrieve file from S3
      const { data, contentType, contentLength } = await getFileFromS3(
        userId,
        filename
      );

      // Return the file with appropriate headers
      return new NextResponse(Buffer.from(data), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': contentLength.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        },
      });
    } catch (retrievalError) {
      console.error('File retrieval error:', retrievalError);

      // Check if it's a file not found error
      if (
        retrievalError instanceof Error &&
        retrievalError.message.includes('File not found')
      ) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      return NextResponse.json(
        { error: 'Failed to retrieve file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
