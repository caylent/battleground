import { auth } from '@clerk/nextjs/server';
import { fetchMutation, fetchQuery, preloadQuery } from 'convex/nextjs';
import { notFound } from 'next/navigation';
import { BattleWrapper } from '@/components/chat';
import { DEFAULT_TEXT_MODEL } from '@/lib/model/models';
import { api } from '../../../../convex/_generated/api';

async function initBattle(userId: string) {
  const chats = await fetchQuery(api.chats.getAllByUser, {
    userId,
    type: 'battle',
  });

  // If no battle chats, create two to start
  if (!chats.length) {
    await fetchMutation(api.chats.create, {
      userId,
      type: 'battle',
      model: DEFAULT_TEXT_MODEL,
      name: 'Battle Chat #1',
    });

    await fetchMutation(api.chats.create, {
      userId,
      type: 'battle',
      model: DEFAULT_TEXT_MODEL,
      name: 'Battle Chat #2',
    });
  }
}

export default async function ChatPage() {
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  initBattle(userId);

  const preloadedChats = await preloadQuery(api.chats.getAllByUser, {
    userId,
    type: 'battle',
  });

  return (
    <div className="scrollbar-thin flex max-w-full gap-1.5 overflow-x-auto pr-18">
      <BattleWrapper preloadedChats={preloadedChats} />
    </div>
  );
}
