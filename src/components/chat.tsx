'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { DefaultChatTransport } from 'ai';
import { type Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { Thread } from '@/components/assistant-ui/thread';
import { api } from '../../convex/_generated/api';
import { ImageTool } from './tools/image-tool';

export const Chat = ({
  preloadedChat,
}: {
  preloadedChat: Preloaded<typeof api.chats.getById>;
}) => {
  const chat = usePreloadedQuery(preloadedChat);
  const router = useRouter();
  const createChat = useMutation(api.chats.create);
  const runtime = useChatRuntime({
    id: chat?._id,
    messages: chat?.messages ?? [],
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest: async ({ messages }) => {
        if (!chat) {
          const chatId = await createChat({
            name: '...',
            initialMessages: messages,
          });

          router.push(`/chat/${chatId}`);

          return { body: { message: messages.at(-1), id: chatId } };
        }

        return {
          body: {
            message: messages.at(-1),
            id: chat?._id,
          },
        };
      },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ImageTool />
      <Thread />
    </AssistantRuntimeProvider>
  );
};
