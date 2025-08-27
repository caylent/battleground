'use client';

import {
  AssistantRuntimeProvider,
  type ChatModelAdapter,
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  useLocalRuntime,
} from '@assistant-ui/react';
import { Thread } from '@/components/assistant-ui/thread';

const MyModelAdapter: ChatModelAdapter = {
  async *run() {
    await Promise.resolve();
    yield {
      content: [{ type: 'text', text: 'Hello, how are you?' }],
    };
  },
};

export default function ChatPage() {
  const runtime = useLocalRuntime(MyModelAdapter, {
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
  });

  return (
    <main className="mx-auto">
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
      </AssistantRuntimeProvider>
    </main>
  );
}
