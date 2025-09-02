'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type FileUIPart } from 'ai';
import { type Preloaded, usePreloadedQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import { textModels } from '@/lib/model/models';
import type { MyUIMessage } from '@/types/app-message';
import type { api } from '../../convex/_generated/api';
import { AppPromptInput } from './app-prompt-input';
import AssistantActions from './assistant-actions';
import { Attachment } from './attachment';
import ChatBackground from './backgrounds/chat-background';
import { StatefulImage } from './stateful-image';
import { Spinner } from './ui/shadcn-io/spinner';
import UserActions from './user-actions';

export default function Chat({
  preloadedChat,
}: {
  preloadedChat: Preloaded<typeof api.chats.getById>;
}) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const [model, setModel] = useState<string>(textModels.at(0)?.id ?? '');
  const chat = usePreloadedQuery(preloadedChat);

  const isFirstMessage = chat?.messages.length === 1;

  const { messages, sendMessage, status, regenerate, setMessages } =
    useChat<MyUIMessage>({
      id: chat?._id,
      resume: true,
      messages: isFirstMessage ? [] : chat?.messages || [],
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
    });

  useEffect(() => {
    setMessages(chat?.messages || []);
  }, [chat, setMessages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to send this once
  useEffect(() => {
    if (isFirstMessage) {
      sendMessage(chat.messages[0]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input, files }, { body: { model } });
      setInput('');
      setFiles([]);
    }
  };

  return (
    <ChatBackground>
      <div className="relative mx-auto size-full h-screen max-w-4xl p-4">
        <div className="flex h-full flex-col">
          <Conversation className="h-full">
            <ConversationContent>
              {messages.map((message, messageIdx) => {
                const isLastMessage = messageIdx === messages.length - 1;

                return (
                  <div key={message.id}>
                    <Message from={message.role} key={message.id}>
                      {message.role === 'user' && (
                        <UserActions
                          chatId={chat?._id ?? ''}
                          message={message}
                        />
                      )}

                      <MessageContent>
                        {message.parts.map((part, partIdx) => {
                          switch (part.type) {
                            case 'text': {
                              return (
                                <div key={`${message.id}-${partIdx}`}>
                                  <Response>{part.text}</Response>
                                </div>
                              );
                            }
                            case 'file': {
                              return (
                                <Attachment
                                  alt={part.filename ?? ''}
                                  contentType={part.mediaType ?? ''}
                                  filename={part.filename ?? ''}
                                  key={`${message.id}-${partIdx}`}
                                  src={part.url ?? ''}
                                />
                              );
                            }
                            case 'reasoning':
                              return (
                                <Reasoning
                                  className="w-full"
                                  isStreaming={status === 'streaming'}
                                  key={`${message.id}-${partIdx}`}
                                >
                                  <ReasoningTrigger />
                                  <ReasoningContent>
                                    {part.text}
                                  </ReasoningContent>
                                </Reasoning>
                              );
                            case 'tool-image_generation':
                              return (
                                <StatefulImage
                                  alt={part.output?.fileName ?? ''}
                                  key={`${message.id}-${partIdx}`}
                                  src={`/api/attachments?filename=${part.output?.fileName}`}
                                  state={part.state}
                                />
                              );
                            default:
                              return null;
                          }
                        })}

                        {(status === 'submitted' || status === 'streaming') &&
                          isLastMessage &&
                          message.role === 'assistant' && (
                            <Spinner className="mt-2" variant="ellipsis" />
                          )}
                        {message.role === 'assistant' &&
                          (!isLastMessage ||
                            (status === 'ready' && isLastMessage)) && (
                            <AssistantActions
                              message={message}
                              onRegenerate={() =>
                                regenerate({ messageId: message.id })
                              }
                            />
                          )}
                      </MessageContent>
                    </Message>
                  </div>
                );
              })}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

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
    </ChatBackground>
  );
}
