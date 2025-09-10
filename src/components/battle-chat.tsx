'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type FileUIPart } from 'ai';
import { type Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
import { useEffect, useRef, useState } from 'react';
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
import type { MyUIMessage } from '@/types/app-message';
import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { PromptInputMessage } from './ai-elements/prompt-input';
import { AppPromptInput } from './app-prompt-input';
import AssistantActions from './assistant-actions';
import { StatefulImage } from './stateful-image';
import { Button } from './ui/button';
import { Spinner } from './ui/shadcn-io/spinner';
import UserActions from './user-actions';

export function BattleChatWrapper({
  preloadedBattle,
}: {
  preloadedBattle: Preloaded<typeof api.battle.getByUserId>;
}) {
  const battle = usePreloadedQuery(preloadedBattle);

  // Register one sender per modelId so duplicates do not send multiple times
  const sendersRef = useRef(
    new Map<string, (args: { text: string; files: FileUIPart[] }) => void>()
  );

  const registerSender = (
    modelId: string,
    fn: (args: { text: string; files: FileUIPart[] }) => void
  ) => {
    sendersRef.current.set(modelId, fn);
    return () => {
      // Only remove if the same function is currently registered
      const current = sendersRef.current.get(modelId);
      if (current === fn) {
        sendersRef.current.delete(modelId);
      }
    };
  };

  const handleSubmitAll = (message: PromptInputMessage) => {
    for (const sender of sendersRef.current.values()) {
      sender(message as any);
    }
  };

  return (
    <div className="scrollbar-none flex overflow-x-auto">
      {battle?.chats.map((chat, idx) => (
        <BattleChat
          battleId={battle?._id}
          chat={chat}
          key={`chat-${chat.id ?? idx}`}
          onSubmitAllAction={handleSubmitAll}
          registerSenderAction={(fn) => registerSender(chat.id, fn)}
        />
      ))}
    </div>
  );
}

export function BattleChat({
  battleId,
  chat,
  onSubmitAllAction,
  registerSenderAction,
}: {
  battleId: Id<'battles'>;
  chat: Doc<'battles'>['chats'][number];
  onSubmitAllAction: (e: PromptInputMessage) => void;
  registerSenderAction: (
    fn: (args: { text: string; files: FileUIPart[] }) => void
  ) => () => void;
}) {
  // Each chat manages its own state/stream for its model
  const [error, setError] = useState<string | null>(null);
  const updateBattleChat = useMutation(api.battle.updateChat);
  const { messages, sendMessage, status, regenerate } = useChat<MyUIMessage>({
    id: chat.id,
    messages: [],
    transport: new DefaultChatTransport({ api: '/api/battle' }),
    onError(e) {
      setError(e.message);
      return 'Error';
    },
  });

  // Register this chat's sender with the wrapper so submitting once sends to all
  useEffect(() => {
    const unregister = registerSenderAction((message) => {
      sendMessage(message as any, { body: { chatId: chat.id } });
    });
    return unregister;
  }, [registerSenderAction, sendMessage, chat.id]);

  return (
    <div className="relative mx-auto size-full h-screen py-2 pr-2">
      <div className="mx-auto flex h-full w-xl flex-col rounded-lg border p-2">
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
                      variant="flat"
                    >
                      {message.parts.map((part, partIdx) => {
                        switch (part.type) {
                          case 'text': {
                            if (part.text.trim() === '') {
                              return null;
                            }
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
                        <UserActions message={message} />
                      )}

                      {message.role === 'assistant' &&
                        (!isLastMessage ||
                          (status === 'ready' && isLastMessage)) && (
                          <AssistantActions message={message} />
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

        <AppPromptInput
          model={chat.model}
          onSubmitAction={onSubmitAllAction}
          setModelAction={(model: any) => {
            updateBattleChat({ battleId, chatId: chat.id, model });
          }}
          status={status}
        />
      </div>
    </div>
  );
}
