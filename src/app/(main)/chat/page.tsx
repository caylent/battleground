'use client';

import { useChat } from '@ai-sdk/react';
import { useAuth } from '@clerk/nextjs';
import { DefaultChatTransport } from 'ai';
import { useMutation } from 'convex/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { AppPromptInput } from '@/components/app-prompt-input';
import CaylentLogo from '@/components/caylent-logo';
import { ChatSuggestions } from '@/components/chat-suggestions';
import { DEFAULT_TEXT_MODEL } from '@/lib/model/models';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';

export default function ChatMainPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [model, setModel] = useState<Doc<'chats'>['model']>(DEFAULT_TEXT_MODEL);
  const [chatId, setChatId] = useState<string | null>(null);
  const createChat = useMutation(api.chats.create);
  const [input, setInput] = useState<string>('');

  const { sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest: ({ messages: sendMessages, body }) => {
        return {
          body: {
            ...body,
            messages: undefined,
            message: sendMessages.at(-1),
          },
        };
      },
    }),
  });

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    try {
      const id = await createChat({
        name: 'New Chat',
        model,
        userId: userId ?? '',
      });

      setChatId(id);
      sendMessage(message as any, { body: { modelId: model, id } });
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast.error('Failed to create chat');
    }
  };

  useEffect(() => {
    // we want to wait until the stream has started before routing to the
    // chat page so the stream can resume properly
    if (status === 'streaming') {
      router.push(`/chat/${chatId}`);
    }
  }, [status, router, chatId]);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col px-[var(--thread-padding-x)]">
        <div className="flex w-full flex-grow flex-col items-center justify-center space-y-12">
          <div className="flex size-full flex-col justify-center gap-4 px-8 text-center md:mt-20">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="font-roboto font-semibold text-2xl tracking-wider"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.5 }}
            >
              Welcome to Battleground!
            </motion.div>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="font-roboto text-muted-foreground/65 text-sm tracking-wider"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.6 }}
            >
              Built by
              <CaylentLogo className="inline-block" />
            </motion.div>
          </div>

          <div className="w-full max-w-2xl space-y-12">
            <ChatSuggestions onSuggestionClick={handleSuggestionClick} />

            <AppPromptInput
              defaultValue={input ?? ''}
              model={model}
              onSubmitAction={handleSubmit}
              setModelAction={setModel}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
