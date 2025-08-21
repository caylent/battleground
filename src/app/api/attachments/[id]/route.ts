import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { getImageFromS3 } from '@/lib/s3-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('id', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the image from S3 using the utility function
    const imageResult = await getImageFromS3(userId, id);

    // Return the image with appropriate headers
    return new NextResponse(new Uint8Array(imageResult.buffer), {
      headers: {
        'Content-Type': imageResult.contentType,
        'Content-Length': imageResult.contentLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error retrieving image from S3:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === 'Image not found') {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }
      if (error.message === 'Missing key parameter') {
        return NextResponse.json(
          { error: 'Missing key parameter' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to retrieve image' },
      { status: 500 }
    );
  }
}
