'use client';

import type { ChatStatus } from 'ai';
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
import type { Doc } from '../../convex/_generated/dataModel';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from './ai-elements/tool';
import AssistantActions from './assistant-actions';
import { StatefulImage } from './stateful-image';
import { Button } from './ui/button';
import { Spinner } from './ui/shadcn-io/spinner';
import UserActions from './user-actions';

export type ChatConversationProps = {
  messages: MyUIMessage[];
  status: ChatStatus;
  error?: string | null;
  onRetryAction: () => void;
  chat: Doc<'chats'>;
  onRegenerateAction: (messageId: string) => void;
};

export default function ChatConversation({
  chat,
  messages,
  status,
  error,
  onRetryAction,
  onRegenerateAction,
}: ChatConversationProps) {
  return (
    <Conversation className="h-full">
      <ConversationContent>
        {messages.length === 0 && <ConversationEmptyState />}

        {messages.map((message, messageIdx) => {
          const isLastMessage = messageIdx === messages.length - 1;

          return (
            <div key={message.id}>
              <Message
                className="max-w-full"
                from={message.role}
                key={message.id}
              >
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
                      case 'tool-global_context_manager':
                        return (
                          <Tool key={`${message.id}-${partIdx}`}>
                            <ToolHeader state={part.state} type={part.type} />
                            <ToolContent>
                              <ToolInput input={part.input} />
                              <ToolOutput
                                errorText={part.errorText}
                                output={part.output}
                              />
                            </ToolContent>
                          </Tool>
                        );
                      default:
                        return null;
                    }
                  })}

                  {message.role === 'user' && (
                    <UserActions chat={chat} message={message} />
                  )}

                  {message.role === 'assistant' &&
                    (!isLastMessage ||
                      (status === 'ready' && isLastMessage)) && (
                      <AssistantActions
                        chat={chat}
                        message={message}
                        onRegenerateAction={onRegenerateAction}
                      />
                    )}
                </MessageContent>
              </Message>
              {(status === 'error' || message.metadata?.error) && (
                <div className="mx-auto flex max-w-xl flex-col items-center gap-2 rounded-xl border bg-muted/20 p-4 text-sm">
                  Error: {error}
                  <Button onClick={onRetryAction} variant="secondary">
                    Try again
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        {status === 'submitted' && <Spinner variant="ellipsis" />}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
