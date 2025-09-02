'use client';

import type { ChatStatus, FileUIPart } from 'ai';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppPromptInput } from '@/components/app-prompt-input';
import { ChatSuggestions } from '@/components/chat-suggestions';
import { textModels } from '@/lib/model/models';
import type { MyUIMessage } from '@/types/app-message';

export default function ElementsChatMainPage() {
  const { resolvedTheme: theme } = useTheme();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const [model, setModel] = useState<string>(textModels.at(0)?.id ?? '');
  const [status, setStatus] = useState<ChatStatus>('ready');

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setStatus('submitted');

      const response = await fetch('/api/chat/create', {
        method: 'POST',
        body: JSON.stringify({
          message: {
            id: 'temp-id',
            role: 'user',
            parts: [...files, { type: 'text', text: input }],
          } satisfies MyUIMessage,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to create chat');
        setStatus('ready');
        return;
      }

      const { chatId } = await response.json();

      // Navigate to the new chat
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast.error('Failed to create chat');
      setStatus('ready');
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col px-[var(--thread-padding-x)]">
        <div className="flex w-full flex-grow flex-col items-center justify-center space-y-12">
          <div className="flex size-full flex-col justify-center gap-4 px-8 text-center md:mt-20">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="font-orbitron font-semibold text-2xl tracking-wider"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.5 }}
            >
              Welcome to Battleground!
            </motion.div>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="font-orbitron text-muted-foreground/65 text-sm tracking-wider"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.6 }}
            >
              Built by
              <Image
                alt="Caylent Logo"
                className="inline-block"
                height={30}
                src={
                  theme === 'dark'
                    ? '/caylent-logo-dark.png'
                    : '/caylent-logo-light.png'
                }
                width={100}
              />
            </motion.div>
          </div>

          <div className="w-full max-w-2xl space-y-12">
            <ChatSuggestions onSuggestionClick={handleSuggestionClick} />

            <AppPromptInput
              files={files}
              input={input}
              model={model}
              onSubmitAction={handleSubmit}
              setFilesAction={setFiles}
              setInputAction={setInput}
              setModelAction={setModel}
              status={status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
