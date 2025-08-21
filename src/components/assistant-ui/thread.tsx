import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react';
import { motion } from 'framer-motion';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Square,
} from 'lucide-react';
import type { FC } from 'react';
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MarkdownText } from './markdown-text';
import { ToolFallback } from './tool-fallback';

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="flex h-full w-xl flex-col bg-background"
      style={{
        ['--thread-max-width' as string]: '48rem',
        ['--thread-padding-x' as string]: '1rem',
      }}
    >
      <ThreadPrimitive.Viewport className="relative flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll">
        <ThreadWelcome />

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            EditComposer,
            AssistantMessage,
          }}
        />

        <ThreadPrimitive.If empty={false}>
          <motion.div className="min-h-6 min-w-6 shrink-0" />
        </ThreadPrimitive.If>
      </ThreadPrimitive.Viewport>

      <Composer />
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        className="-top-12 absolute z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
        tooltip="Scroll to bottom"
        variant="outline"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col px-[var(--thread-padding-x)]">
        <div className="flex w-full flex-grow flex-col items-center justify-center">
          <div className="flex size-full flex-col justify-center px-8 md:mt-20">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="font-semibold text-2xl"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.5 }}
            >
              Hello there!
            </motion.div>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl text-muted-foreground/65"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.6 }}
            >
              How can I help you today?
            </motion.div>
          </div>
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadWelcomeSuggestions: FC = () => {
  return (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      {[
        {
          title: 'What are the advantages',
          label: 'of using Assistant Cloud?',
          action: 'What are the advantages of using Assistant Cloud?',
        },
        {
          title: 'Write code to',
          label: 'demonstrate topological sorting',
          action: 'Write code to demonstrate topological sorting',
        },
        {
          title: 'Help me write an essay',
          label: 'about AI chat applications',
          action: 'Help me write an essay about AI chat applications',
        },
        {
          title: 'What is the weather',
          label: 'in San Francisco?',
          action: 'What is the weather in San Francisco?',
        },
      ].map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="[&:nth-child(n+3)]:hidden sm:[&:nth-child(n+3)]:block"
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          transition={{ delay: 0.05 * index }}
        >
          <ThreadPrimitive.Suggestion
            asChild
            autoSend
            method="replace"
            prompt={suggestedAction.action}
          >
            <Button
              aria-label={suggestedAction.action}
              className="h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 rounded-xl border px-4 py-3.5 text-left text-sm sm:flex-col dark:hover:bg-accent/60"
              variant="ghost"
            >
              <span className="font-medium">{suggestedAction.title}</span>
              <p className="text-muted-foreground">{suggestedAction.label}</p>
            </Button>
          </ThreadPrimitive.Suggestion>
        </motion.div>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  return (
    <div className="relative mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 bg-background px-[var(--thread-padding-x)] pb-4 md:pb-6">
      <ThreadScrollToBottom />
      <ThreadPrimitive.Empty>
        <ThreadWelcomeSuggestions />
      </ThreadPrimitive.Empty>
      <ComposerPrimitive.Root className="relative flex w-full flex-col rounded-2xl focus-within:ring-1 focus-within:ring-muted-foreground">
        <ComposerPrimitive.Input
          aria-label="Message input"
          autoFocus
          className="max-h-[calc(50dvh)] min-h-16 w-full resize-none rounded-t-2xl border-border border-x border-t bg-muted px-4 pt-2 pb-3 text-base outline-none placeholder:text-muted-foreground focus:outline-primary dark:border-muted-foreground/15"
          placeholder="Send a message..."
          rows={1}
        />
        <ComposerAction />
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="relative flex items-center justify-between rounded-b-2xl border-border border-x border-b bg-muted p-2 dark:border-muted-foreground/15">
      <TooltipIconButton
        className="scale-115 p-3.5 hover:bg-foreground/15 dark:hover:bg-background/50"
        onClick={() => {
          console.log('Attachment clicked - not implemented');
        }}
        tooltip="Attach file"
        variant="ghost"
      >
        <PlusIcon />
      </TooltipIconButton>

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <Button
            aria-label="Send message"
            className="size-8 rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
            type="submit"
            variant="default"
          >
            <ArrowUpIcon className="size-5" />
          </Button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button
            aria-label="Stop generating"
            className="size-8 rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
            type="button"
            variant="default"
          >
            <Square className="size-3.5 fill-white dark:size-4 dark:fill-black" />
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="relative mx-auto grid w-full max-w-[var(--thread-max-width)] grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] px-[var(--thread-padding-x)] py-4"
        data-role="assistant"
        initial={{ y: 5, opacity: 0 }}
      >
        {/* <div className="col-start-1 row-start-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <StarIcon size={14} />
        </div> */}

        <div className="col-span-2 col-start-2 row-start-1 ml-4 break-words text-foreground text-sm leading-7">
          <MessagePrimitive.Content
            components={{
              Text: MarkdownText,
              tools: { Fallback: ToolFallback },
            }}
          />
          <MessageError />
        </div>

        <AssistantActionBar />

        <BranchPicker className="-ml-2 col-start-2 row-start-2 mr-2" />
      </motion.div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      autohide="not-last"
      autohideFloat="single-branch"
      className="col-start-3 row-start-2 mt-3 ml-3 flex gap-1 text-muted-foreground data-floating:absolute data-floating:mt-2 data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
      hideWhenRunning
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-1 px-[var(--thread-padding-x)] py-4 [&:where(>*)]:col-start-2"
        data-role="user"
        initial={{ y: 5, opacity: 0 }}
      >
        <UserActionBar />

        <div className="col-start-2 break-words rounded-3xl bg-muted px-5 py-2.5 text-foreground text-sm">
          <MessagePrimitive.Content components={{ Text: MarkdownText }} />
        </div>

        <BranchPicker className="-mr-1 col-span-full col-start-1 row-start-3 justify-end" />
      </motion.div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      autohide="not-last"
      className="col-start-1 mt-2.5 mr-3 flex flex-col items-end"
      hideWhenRunning
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-[var(--thread-padding-x)]">
      <ComposerPrimitive.Root className="ml-auto flex w-full max-w-7/8 flex-col rounded-xl bg-muted">
        <ComposerPrimitive.Input
          autoFocus
          className="flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
        />

        <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button aria-label="Cancel edit" size="sm" variant="ghost">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button aria-label="Update message" size="sm">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      className={cn(
        'inline-flex items-center text-muted-foreground text-xs',
        className
      )}
      hideWhenSingleBranch
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
