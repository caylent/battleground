import { UI_MESSAGE_STREAM_HEADERS } from 'ai';
import { fetchQuery } from 'convex/nextjs';
import { after } from 'next/server';
import { createResumableStreamContext } from 'resumable-stream';
import { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const chat = await fetchQuery(api.chats.getById, { id: id as Id<'chats'> });

  if (chat?.activeStreamId == null) {
    // no content response when there is no active stream
    return new Response(null, { status: 204 });
  }

  const streamContext = createResumableStreamContext({
    waitUntil: after,
  });

  return new Response(
    await streamContext.resumeExistingStream(chat.activeStreamId),
    { headers: UI_MESSAGE_STREAM_HEADERS }
  );
}
