'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type FileUIPart } from 'ai';
import { type Preloaded, usePreloadedQuery } from 'convex/react';
import { useState } from 'react';
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
import type { MyUIMessage } from '@/types/app-message';
import type { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { AppPromptInput } from './app-prompt-input';
import AssistantActions from './assistant-actions';
import { Attachment } from './attachment';
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

  return (
    <div className="scrollbar-none flex overflow-x-auto">
      {battle?.chats.map((chat, idx) => (
        <>
          <BattleChat chat={chat} key={idx} />
          <BattleChat chat={chat} key={idx} />
          <BattleChat chat={chat} key={idx} />
          <BattleChat chat={chat} key={idx} />
        </>
      ))}
    </div>
  );
}

export function BattleChat({
  chat,
}: {
  chat: Doc<'battles'>['chats'][number];
}) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { messages, sendMessage, status, regenerate } = useChat<MyUIMessage>({
    messages: [],
    transport: new DefaultChatTransport({ api: '/api/battle' }),
    onError(e) {
      setError(e.message);
      return 'Error';
    },
  });

  console.log(status);

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
      <div className="mx-auto flex h-full w-xl flex-col rounded-lg border p-2">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message, messageIdx) => {
              const isLastMessage = messageIdx === messages.length - 1;

              return (
                <div key={message.id}>
                  <Message from={message.role} key={message.id}>
                    <MessageContent className="relative overflow-visible">
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
          files={files}
          input={input}
          model={chat}
          onSubmitAction={handleSubmit}
          setFilesAction={setFiles}
          setInputAction={setInput}
          setModelAction={() => {
            // updateBattle({ id, model });
          }}
          status={status}
        />
      </div>
    </div>
  );
}
