'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { type Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { textModels } from '@/lib/model/models';
import type { MyUIMessage } from '@/types/app-message';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { AppPromptInput } from './app-prompt-input';
import ChatConversation from './chat-conversation';

export function Chat({
  preloadedChat,
}: {
  preloadedChat: Preloaded<typeof api.chats.getById>;
}) {
  const [error, setError] = useState<string | null>(null);
  const chat = usePreloadedQuery(preloadedChat);
  const updateChat = useMutation(api.chats.update);

  const { messages, sendMessage, status, regenerate, setMessages } =
    useChat<MyUIMessage>({
      id: chat?._id,
      resume: true,
      messages: chat?.messages || [],
      transport: new DefaultChatTransport({
        prepareSendMessagesRequest: ({
          messages: sendMessages,
          trigger,
          body,
        }) => {
          return {
            body: {
              ...body,
              messages: undefined,
              id: chat?._id,
              message: sendMessages.at(-1),
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

  useEffect(() => {
    setMessages(chat?.messages || []);
  }, [chat, setMessages]);

  return (
    <div className="relative mx-auto size-full h-screen">
      <div className="mx-auto flex h-full max-w-4xl flex-col px-2 py-2 md:pr-2 md:pl-0">
        <ChatConversation
          chatId={chat?._id}
          error={error}
          messages={messages}
          onRegenerateAction={(messageId) => regenerate({ messageId })}
          onRetryAction={() => regenerate()}
          status={status}
        />

        <div className="p-2 md:p-0">
          <AppPromptInput
            model={chat?.model ?? textModels[0]}
            onSubmitAction={(message) => sendMessage(message as any)}
            setModelAction={(model) => {
              updateChat({ id: chat?._id as Id<'chats'>, model });
            }}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
