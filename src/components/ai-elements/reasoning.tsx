'use client';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import type { ReasoningUIPart } from 'ai';
import { BrainIcon, ChevronDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Response } from './response';

type ReasoningContextValue = {
  reasoningPart?: ReasoningUIPart;
  duration: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error('Reasoning components must be used within Reasoning');
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  reasoningPart?: ReasoningUIPart;
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

export const Reasoning = memo(
  ({
    className,
    reasoningPart,
    duration,
    open,
    defaultOpen = false,
    onOpenChange,
    children,
    ...props
  }: ReasoningProps) => {
    const isStreaming = reasoningPart?.state === 'streaming';

    // Start closed by default unless controlled via `open` OR we are currently streaming
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: isStreaming ? true : defaultOpen,
      onChange: onOpenChange,
    });

    const [hasStreamed, setHasStreamed] = useState(false);
    const [hasAutoClosedRef, setHasAutoClosedRef] = useState(false);

    // Track whether we've ever been in streaming state during this component's lifecycle
    useEffect(() => {
      if (isStreaming) {
        setHasStreamed(true);
        // Ensure it's open while streaming
        if (!isOpen) setIsOpen(true);
      }
    }, [isStreaming, isOpen, setIsOpen]);

    // Auto-close only if we previously streamed and now not streaming
    useEffect(() => {
      if (hasStreamed && !isStreaming && isOpen && !hasAutoClosedRef) {
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosedRef(true);
        }, AUTO_CLOSE_DELAY);

        return () => clearTimeout(timer);
      }
    }, [hasStreamed, isStreaming, isOpen, hasAutoClosedRef, setIsOpen]);

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
    };

    return (
      <ReasoningContext.Provider
        value={{ isOpen, setIsOpen, reasoningPart, duration: duration ?? 0 }}
      >
        <Collapsible
          className={cn('not-prose mb-4', className)}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  }
);

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger>;

export const ReasoningTrigger = memo(
  ({ className, children, ...props }: ReasoningTriggerProps) => {
    const { reasoningPart, isOpen, duration } = useReasoning();

    return (
      <CollapsibleTrigger
        className={cn(
          'flex items-center gap-2 text-muted-foreground text-sm',
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <BrainIcon className="size-4" />
            {reasoningPart?.state === 'streaming' ? (
              <p>Thinking...</p>
            ) : (
              <p>Thought for {Math.round(duration / MS_IN_S)} seconds</p>
            )}
            <ChevronDownIcon
              className={cn(
                'size-4 text-muted-foreground transition-transform',
                isOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  }
);

export type ReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export const ReasoningContent = memo(
  ({ className, children, ...props }: ReasoningContentProps) => {
    const labelId = useId();

    return (
      <CollapsibleContent
        className={cn(
          'mt-4 text-sm',
          'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
          className
        )}
        {...props}
      >
        <section
          aria-labelledby={labelId}
          className="relative rounded-md border bg-muted/40 p-3 shadow-sm"
        >
          <span className="sr-only" id={labelId}>
            Model reasoning
          </span>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 h-full w-1 rounded-l-md bg-primary/70"
          />
          <Response className="grid gap-2 italic">{children}</Response>
        </section>
      </CollapsibleContent>
    );
  }
);

Reasoning.displayName = 'Reasoning';
ReasoningTrigger.displayName = 'ReasoningTrigger';
ReasoningContent.displayName = 'ReasoningContent';
