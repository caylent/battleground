import { auth } from '@clerk/nextjs/server';
import { fetchMutation, fetchQuery, preloadQuery } from 'convex/nextjs';
import { notFound } from 'next/navigation';
import { BattleChatWrapper } from '@/components/battle-chat';
import { DEFAULT_TEXT_MODEL } from '@/lib/model/models';
import { api } from '../../../../convex/_generated/api';

export default async function ChatPage() {
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  const battle = await fetchQuery(api.battle.getByUserId, {
    userId,
  });

  if (!battle) {
    await fetchMutation(api.battle.create, {
      userId,
      chats: [DEFAULT_TEXT_MODEL],
    });
  }

  const preloadedBattle = await preloadQuery(api.battle.getByUserId, {
    userId,
  });

  return (
    <main className="flex max-h-screen-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex max-h-lvh max-w-full flex-1 flex-row gap-2 overflow-x-auto">
        <BattleChatWrapper preloadedBattle={preloadedBattle} />
      </div>
    </main>
  );
}
