'use client';

import { CheckIcon, CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { useState } from 'react';
import type { MyUIMessage } from '@/types/app-message';
import { Action, Actions } from './ai-elements/actions';
import InlineMetadata from './inline-metadata';

export type AssistantActionsProps = {
  message: MyUIMessage;
  onRegenerateAction: (messageId: string) => void;
};

export default function AssistantActions({
  message,
  onRegenerateAction,
}: AssistantActionsProps) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Actions>
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
      <Action label="Retry" onClick={() => onRegenerateAction(message.id)}>
        <RefreshCcwIcon className="size-3" />
      </Action>

      {message.metadata && <InlineMetadata metadata={message.metadata} />}
    </Actions>
  );
}
