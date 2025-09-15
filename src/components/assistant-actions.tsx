'use client';

import { CheckIcon, CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { useState } from 'react';
import type { MyUIMessage } from '@/types/app-message';
import type { Doc } from '../../convex/_generated/dataModel';
import { Action, Actions } from './ai-elements/actions';
import InlineMetadata from './inline-metadata';
import ResponseMetadata from './response-metadata';

export type AssistantActionsProps = {
  chat: Doc<'chats'>;
  message: MyUIMessage;
  onRegenerateAction: (messageId: string) => void;
};

export default function AssistantActions({
  chat,
  message,
  onRegenerateAction,
}: AssistantActionsProps) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Actions className="-bottom-8 absolute">
      <Action
        label="Copy"
        onClick={() => {
          if (isCopied) return;
          navigator.clipboard.writeText(
            message.parts
              .filter((p) => p.type === 'text')
              .map((p) => p.text)
              .join('\n\n')
          );
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        }}
      >
        {isCopied ? (
          <CheckIcon className="size-3 text-green-500" />
        ) : (
          <CopyIcon className="size-3" />
        )}
      </Action>
      {chat.type === 'chat' && (
        <Action label="Retry" onClick={() => onRegenerateAction(message.id)}>
          <RefreshCcwIcon className="size-3" />
        </Action>
      )}

      {message.metadata && <ResponseMetadata metadata={message.metadata} />}

      {message.metadata && <InlineMetadata metadata={message.metadata} />}
    </Actions>
  );
}
