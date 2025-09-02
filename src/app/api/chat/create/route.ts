import { auth } from '@clerk/nextjs/server';
import { fetchMutation } from 'convex/nextjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateChatName } from '@/lib/generate-chat-name';
import { uploadAttachments } from '@/lib/upload-attachments';
import type { MyUIMessage } from '@/types/app-message';
import { api } from '../../../../../convex/_generated/api';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { message } = (await req.json()) as {
    message: MyUIMessage;
  };

  const updatedMessage = await uploadAttachments(userId, message);

  if (!message) {
    return new Response('No message found', { status: 400 });
  }

  const chatName = await generateChatName(message);
  const chatId = await fetchMutation(api.chats.create, {
    name: chatName,
    messages: [updatedMessage],
  });

  console.log('chatId', chatId, 'chatName', chatName);

  return NextResponse.json({ chatId });
}
