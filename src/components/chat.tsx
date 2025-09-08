'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type FileUIPart } from 'ai';
import { type Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
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
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { AppPromptInput } from './app-prompt-input';
import AssistantActions from './assistant-actions';
import { Attachment } from './attachment';
import { StatefulImage } from './stateful-image';
import { Spinner } from './ui/shadcn-io/spinner';
import UserActions from './user-actions';

export function Chat({
  preloadedChat,
}: {
  preloadedChat: Preloaded<typeof api.chats.getById>;
}) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const chat = usePreloadedQuery(preloadedChat);
  const updateChat = useMutation(api.chats.update);

  const { messages, sendMessage, status, regenerate, setMessages } =
    useChat<MyUIMessage>({
      id: chat?._id,
      resume: true,
      messages: chat?.messages || [],
      transport: new DefaultChatTransport({
        prepareSendMessagesRequest: ({ messages: sendMessages, trigger }) => {
          return {
            body: {
              id: chat?._id,
              message: sendMessages.at(-1),
              trigger,
            },
          };
        },
      }),
    });

  useEffect(() => {
    setMessages(chat?.messages || []);
  }, [chat, setMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input, files });
      setInput('');
      setFiles([]);
    }
  };

  return (
    <div className="relative mx-auto size-full h-screen py-2 pr-2">
      <div className="mx-auto flex h-full max-w-4xl flex-col">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message, messageIdx) => {
              const isLastMessage = messageIdx === messages.length - 1;

              return (
                <div key={message.id}>
                  <Message from={message.role} key={message.id}>
                    {message.role === 'user' && (
                      <UserActions chatId={chat?._id ?? ''} message={message} />
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
                                duration={message.metadata?.reasoningTime}
                                key={`${message.id}-${partIdx}`}
                                reasoningPart={part}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent>{part.text}</ReasoningContent>
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

                      {message.role === 'assistant' &&
                        (!isLastMessage ||
                          (status === 'ready' && isLastMessage)) && (
                          <AssistantActions
                            message={message}
                            onRegenerateAction={() =>
                              regenerate({ messageId: message.id })
                            }
                          />
                        )}
                    </MessageContent>
                  </Message>
                </div>
              );
            })}
            {status === 'submitted' && <Spinner variant="ellipsis" />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <AppPromptInput
          files={files}
          input={input}
          model={chat?.model ?? textModels[0]}
          onSubmitAction={handleSubmit}
          setFilesAction={setFiles}
          setInputAction={setInput}
          setModelAction={(model) => {
            updateChat({ id: chat?._id as Id<'chats'>, model });
          }}
          status={status}
        />
      </div>
    </div>
  );
}
