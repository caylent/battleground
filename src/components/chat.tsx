'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { type Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAttachment,
  MessageContent,
} from '@/components/ai-elements/message';
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
import { StatefulImage } from './stateful-image';
import { Button } from './ui/button';
import { Spinner } from './ui/shadcn-io/spinner';
import UserActions from './user-actions';

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
        <Conversation className="h-full">
          <ConversationContent>
            {messages.length === 0 && <ConversationEmptyState />}

            {messages.map((message, messageIdx) => {
              const isLastMessage = messageIdx === messages.length - 1;

              return (
                <div key={message.id}>
                  <Message from={message.role} key={message.id}>
                    <MessageContent
                      className="relative overflow-visible"
                      variant={'flat'}
                    >
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
                              <MessageAttachment
                                data={{
                                  ...part,
                                  id: `${message.id}-${partIdx}`,
                                }}
                                key={`${message.id}-${partIdx}`}
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

                      {message.role === 'user' && (
                        <UserActions
                          chatId={chat?._id ?? ''}
                          message={message}
                        />
                      )}

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
            {status === 'error' && (
              <div className="mx-auto flex max-w-xl flex-col items-center gap-2 rounded-xl border bg-muted/20 p-4 text-sm">
                Error: {error}
                <Button onClick={() => regenerate()} variant={'secondary'}>
                  Try again
                </Button>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

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
