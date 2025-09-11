'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { type Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
import { notFound } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { MyUIMessage } from '@/types/app-message';
import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { PromptInputMessage } from './ai-elements/prompt-input';
import { AppPromptInput } from './app-prompt-input';
import { BattleChatHeader } from './battle-chat-header';
import ChatConversation from './chat-conversation';

export function BattleWrapper({
  preloadedChats,
}: {
  preloadedChats: Preloaded<typeof api.chats.getAllByUser>;
}) {
  const chats = usePreloadedQuery(preloadedChats);

  const sendersRef = useRef(
    new Map<Id<'chats'>, (args: PromptInputMessage) => void>()
  );

  const registerSender = (
    chatId: Id<'chats'>,
    fn: (args: PromptInputMessage) => void
  ) => {
    sendersRef.current.set(chatId, fn);
    return () => {
      // Only remove if the same function is currently registered
      const current = sendersRef.current.get(chatId);
      if (current === fn) {
        sendersRef.current.delete(chatId);
      }
    };
  };

  const handleSubmitAll = (message: PromptInputMessage) => {
    for (const sender of sendersRef.current.values()) {
      sender(message);
    }
  };

  return chats.map((chat) => (
    <div className="h-screen py-2" key={chat?._id}>
      <div className="flex h-full w-xl flex-col rounded-lg border p-2">
        <Chat
          chat={chat}
          onSubmitAllAction={handleSubmitAll}
          registerSenderAction={registerSender}
        />
      </div>
    </div>
  ));
}

export function ChatWrapper({
  preloadedChat,
}: {
  preloadedChat: Preloaded<typeof api.chats.getById>;
}) {
  const chat = usePreloadedQuery(preloadedChat);

  if (!chat) {
    return notFound();
  }

  return (
    <div className="relative mx-auto h-screen w-full md:w-[calc(100vw-var(--sidebar-width))]">
      <div className="mx-auto flex h-full min-w-0 max-w-4xl flex-col px-2 py-2 md:pr-2 md:pl-0">
        <Chat chat={chat} />
      </div>
    </div>
  );
}

type ChatProps = {
  chat: Doc<'chats'>;
  onSubmitAllAction?: (message: PromptInputMessage) => void;
  registerSenderAction?: (
    chatId: Id<'chats'>,
    fn: (args: PromptInputMessage) => void
  ) => () => void;
};

export function Chat({
  chat,
  onSubmitAllAction,
  registerSenderAction,
}: ChatProps) {
  const [error, setError] = useState<string | null>(null);
  const updateChat = useMutation(api.chats.update);

  const { messages, sendMessage, status, regenerate, setMessages } =
    useChat<MyUIMessage>({
      id: chat._id,
      resume: !!chat.activeStreamId,
      messages: chat.messages,
      transport: new DefaultChatTransport({
        prepareSendMessagesRequest: ({
          messages: sendMessages,
          trigger,
          body,
        }) => {
          const lastUserMessage = sendMessages.findLast(
            (message) => message.role === 'user'
          );
          return {
            body: {
              ...body,
              messages: undefined,
              id: chat._id,
              message: lastUserMessage,
              trigger,
            },
          };
        },
      }),
      onError(e) {
        setError(e.message);
        return 'Error';
      },
    });

  console.log('status', status);

  useEffect(() => {
    setMessages(chat.messages || []);
  }, [chat, setMessages]);

  // Register this chat's sender with the wrapper so submitting once sends to all
  useEffect(() => {
    if (!registerSenderAction) return;
    const unregister = registerSenderAction(chat._id, (message) => {
      sendMessage(message as any);
    });
    return unregister;
  }, [registerSenderAction, sendMessage, chat._id]);

  return (
    <>
      {chat.type === 'battle' && <BattleChatHeader chat={chat} />}

      <ChatConversation
        chat={chat}
        error={error}
        messages={messages}
        onRegenerateAction={(messageId) => regenerate({ messageId })}
        onRetryAction={() => regenerate()}
        status={status}
      />

      <div className="p-2 md:p-0">
        <AppPromptInput
          chatType={chat.type}
          model={chat.model}
          onSubmitAction={(message) =>
            chat.type === 'battle'
              ? onSubmitAllAction?.(message)
              : sendMessage(message as any)
          }
          setModelAction={(model) => {
            updateChat({ id: chat?._id as Id<'chats'>, model });
          }}
          status={status}
        />
      </div>
    </>
  );
}
