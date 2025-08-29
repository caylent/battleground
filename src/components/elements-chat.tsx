'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type FileUIPart } from 'ai';
import { type Preloaded, usePreloadedQuery } from 'convex/react';
import {
  CheckIcon,
  CopyIcon,
  Loader2,
  PaperclipIcon,
  RefreshCcwIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
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
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import { textModels } from '@/lib/model/models';
import type { MyUIMessage } from '@/types/app-message';
import type { api } from '../../convex/_generated/api';
import { Action, Actions } from './ai-elements/actions';
import { Attachment } from './attachment';
import { StatefulImage } from './stateful-image';

export default function ElementsChat({
  preloadedChat,
}: {
  preloadedChat: Preloaded<typeof api.chats.getById>;
}) {
  const [input, setInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const { openFilePicker } = useFilePicker({
    accept: 'image/*, text/*',
    readAs: 'DataURL',
    onFilesSuccessfullySelected: ({ filesContent }) => {
      for (const file of filesContent) {
        setFiles((prev) => [
          ...prev,
          {
            url: file.content,
            filename: file.name,
            mediaType: file.type,
            type: 'file',
          },
        ]);
      }
    },
  });
  const [model, setModel] = useState<string>(textModels.at(0)?.id ?? '');
  const chat = usePreloadedQuery(preloadedChat);

  const { messages, sendMessage, status, regenerate } = useChat<MyUIMessage>({
    id: chat?._id,
    messages: chat?.messages || [],
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest: ({ messages: sendMessages, trigger }) => {
        return {
          body: {
            message: sendMessages.at(-1),
            id: chat?._id,
            trigger,
          },
        };
      },
    }),
    onError: (err) => {
      toast.error(`Failed to send message: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input, files }, { body: { model } });
      setInput('');
      setFiles([]);
    }
  };

  return (
    <div className="relative mx-auto size-full h-screen max-w-4xl p-6">
      <div className="flex h-full flex-col">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text': {
                          return (
                            <div key={`${message.id}-${i}`}>
                              <Response>{part.text}</Response>
                              {message.role === 'assistant' && (
                                <Actions className="mt-2">
                                  <Action
                                    label="Retry"
                                    onClick={() =>
                                      regenerate({
                                        messageId: message.id,
                                      })
                                    }
                                  >
                                    <RefreshCcwIcon className="size-3" />
                                  </Action>
                                  <Action
                                    label="Copy"
                                    onClick={() => {
                                      if (isCopied) return;
                                      navigator.clipboard.writeText(part.text);
                                      setIsCopied(true);
                                      setTimeout(() => {
                                        setIsCopied(false);
                                      }, 2000);
                                    }}
                                  >
                                    {isCopied ? (
                                      <CheckIcon className="size-3" />
                                    ) : (
                                      <CopyIcon className="size-3" />
                                    )}
                                  </Action>
                                </Actions>
                              )}
                            </div>
                          );
                        }
                        case 'file': {
                          return (
                            <Attachment
                              alt={part.filename ?? ''}
                              contentType={part.mediaType ?? ''}
                              filename={part.filename ?? ''}
                              key={`${message.id}-${i}`}
                              src={part.url ?? ''}
                            />
                          );
                        }
                        case 'reasoning':
                          return (
                            <Reasoning
                              className="w-full"
                              isStreaming={status === 'streaming'}
                              key={`${message.id}-${i}`}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        case 'tool-image_generation':
                          return (
                            <StatefulImage
                              alt={part.output?.fileName ?? ''}
                              key={`${message.id}-${i}`}
                              src={`/api/attachments?filename=${part.output?.fileName}`}
                              state={part.state}
                            />
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              </div>
            ))}
            {(status === 'submitted' || status === 'streaming') && (
              <Loader2 className="size-3 animate-spin" />
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput className="mt-2" onSubmit={handleSubmit}>
          {files.length > 0 && (
            <div className="flex flex-row flex-wrap gap-2 p-2">
              {files.map((file) => (
                <Attachment
                  alt={file.filename ?? ''}
                  contentType={file.mediaType ?? ''}
                  filename={file.filename ?? ''}
                  key={file.filename ?? ''}
                  onDeleteAction={() => {
                    setFiles(files.filter((f) => f.url !== file.url));
                  }}
                  src={file.url}
                />
              ))}
            </div>
          )}
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton onClick={openFilePicker}>
                <PaperclipIcon className="size-3" />
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
            </PromptInputTools>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
