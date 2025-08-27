import { preloadQuery } from 'convex/nextjs';
import { Chat } from '@/components/chat';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: Id<'chats'> }>;
}) {
  const { id } = await params;

  const preloadedChat = await preloadQuery(api.chats.getById, { id });

  return (
    <main className="mx-auto">
      <Chat preloadedChat={preloadedChat} />
    </main>
  );
}
