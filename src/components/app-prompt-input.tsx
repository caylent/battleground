'use client';

import { useMutation } from 'convex/react';
import { PaperclipIcon, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { textModels } from '@/lib/model/models';
import { api } from '../../convex/_generated/api';

export const AppPromptInput = () => {
  const router = useRouter();
  const [text, setText] = useState<string>('');
  const [model, setModel] = useState<string>(textModels[0].id);

  const createChat = useMutation(api.chats.create);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const chatId = await createChat({
      name: 'New Chat',
      initialMessages: [],
    });
    router.push(`/chat/${chatId}`);
    setText('');
  };

  return (
    <PromptInput className="w-[90%] max-w-3xl" onSubmit={handleSubmit}>
      <PromptInputTextarea
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputButton>
            <PaperclipIcon size={16} />
          </PromptInputButton>
          <PromptInputModelSelect
            onValueChange={(value) => {
              setModel(value);
            }}
            value={model}
          >
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              {textModels.map((m) => (
                <PromptInputModelSelectItem key={m.id} value={m.id}>
                  {m.name}
                </PromptInputModelSelectItem>
              ))}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
          <PromptInputButton>
            <Settings size={16} />
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit disabled={!text} status={'ready'} />
      </PromptInputToolbar>
    </PromptInput>
  );
};
