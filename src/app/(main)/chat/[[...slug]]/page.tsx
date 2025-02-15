"use client";

import { ChatPanel } from "@/components/chat-panel";
import { useChatStore, useChatStoreHydrated } from "@/stores/chat-store";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function Chat() {
  const [chats, setChats] = useState(useChatStore.getState().chats);
  const isLoaded = useChatStoreHydrated();

  useChatStore.subscribe((state) => {
    if (!isLoaded) return;

    if (state.chats.length !== chats.length) {
      setChats(state.chats);
      return;
    }

    for (const chat of state.chats) {
      const existingChat = chats.find((c) => c.id === chat.id);
      if (!existingChat) {
        setChats(state.chats);
        return;
      }
    }
  });

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex max-h-lvh max-w-full flex-1 flex-row gap-2 overflow-x-auto p-2">
        {isLoaded ? (
          chats.map((chat) => <ChatPanel key={chat.id} chatId={chat.id} />)
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Loading chats...</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
