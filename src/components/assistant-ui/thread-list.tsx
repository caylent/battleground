import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from '@assistant-ui/react';
import { ArchiveIcon, PlusIcon } from 'lucide-react';
import type { FC } from 'react';
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button';
import { Button } from '@/components/ui/button';

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5 text-foreground">
      <ThreadListNew />
      <ThreadListItems />
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
        variant="ghost"
      >
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="flex items-center gap-2 rounded-lg transition-all hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-active:bg-muted">
      <ThreadListItemPrimitive.Trigger className="flex-grow px-3 py-2 text-start">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemArchive />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <p className="text-sm">
      <ThreadListItemPrimitive.Title fallback="New Chat" />
    </p>
  );
};

const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="mr-1 ml-auto size-4 p-4 text-foreground hover:text-foreground/60"
        tooltip="Archive thread"
        variant="ghost"
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
