import { auth } from '@clerk/nextjs/server';
import type { UIMessage } from 'ai';
import { fetchMutation } from 'convex/nextjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateChatName } from '@/lib/generate-chat-name';
import { api } from '../../../../../convex/_generated/api';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { message } = (await req.json()) as {
    message: UIMessage;
  };

  if (!message) {
    return new Response('No message found', { status: 400 });
  }

  try {
    const chatName = await generateChatName(message);
    const chatId = await fetchMutation(api.chats.create, { name: chatName });

    return NextResponse.redirect(new URL(`/chat/${chatId}`, req.url));
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      { status: err.httpStatusCode }
    );
  }
}
