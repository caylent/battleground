'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { DefaultChatTransport } from 'ai';
import { Thread } from '@/components/assistant-ui/thread';
import type { Chat as ChatType } from '@/stores/chat-store';
import { ImageTool } from './tools/image-tool';

export const Chat = ({ chat }: { chat: ChatType }) => {
  const runtime = useChatRuntime({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        modelId: chat.model.id,
      },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ImageTool />
      <div className="h-dvh gap-x-2">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};
