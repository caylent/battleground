'use client';

import { useMutation } from 'convex/react';
import { CheckIcon, CopyIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { MyUIMessage } from '@/types/app-message';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Action, Actions } from './ai-elements/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

export type UserActionsProps = {
  chatId?: string;
  message: MyUIMessage;
};

export default function UserActions({ chatId, message }: UserActionsProps) {
  const deleteMessage = useMutation(api.chats.deleteMessageAndAfter);
  const [isCopied, setIsCopied] = useState(false);

  const handleDelete = () => {
    deleteMessage({
      chatId: chatId as Id<'chats'>,
      messageId: message.id,
    });
  };

  return (
    <Actions className="-bottom-8 absolute right-0">
      {chatId && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Action label="Delete">
              <Trash2 className="size-3" />
            </Action>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Message</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this message and all messages
                after it? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
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
    </Actions>
  );
}
