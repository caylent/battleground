'use client';

import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  return (
    <main className="flex max-h-screen-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex max-h-lvh max-w-full flex-1 flex-row gap-2 overflow-x-auto">
        {/* {isLoaded ? (
          chats.map((chat) => <Chat chat={chat} key={chat.id} />)
        ) : ( */}
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="font-medium text-muted-foreground text-sm">
              Loading chats...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
