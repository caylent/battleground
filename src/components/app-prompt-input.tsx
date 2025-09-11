'use client';

import type { ChatStatus } from 'ai';
import { BrainIcon, ImageIcon, PaperclipIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import { type TextModel, textModels } from '@/lib/model/models';
import type { Doc } from '../../convex/_generated/dataModel';
import { ModelCombobox } from './model-combobox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export type AppPromptInputProps = {
  status: ChatStatus;
  onSubmitAction: (event: PromptInputMessage) => void;
  defaultValue?: string;
  model: Doc<'chats'>['model'];
  chatType: Doc<'chats'>['type'];
  setModelAction: (model: Doc<'chats'>['model']) => void;
};

export const AppPromptInput = ({
  defaultValue = '',
  status,
  onSubmitAction,
  model,
  chatType,
  setModelAction,
}: AppPromptInputProps) => {
  const [input, setInput] = useState(defaultValue);

  useEffect(() => {
    setInput(defaultValue);
  }, [defaultValue]);

  return (
    <PromptInput
      className="relative mt-4 rounded-xl bg-white/5"
      globalDrop
      multiple
      onSubmit={(message) => {
        onSubmitAction(message);
        setInput('');
      }}
    >
      <PromptInputBody>
        <PromptInputAttachments>
          {(attachment) => <PromptInputAttachment data={attachment} />}
        </PromptInputAttachments>
        <AppPromptInputTextarea
          input={input}
          model={model}
          setInput={setInput}
        />
      </PromptInputBody>

      <AppPromptInputToolbar
        chatType={chatType}
        input={input}
        model={model}
        setModelAction={setModelAction}
        status={status}
      />
    </PromptInput>
  );
};

const AppPromptInputTextarea = ({
  model,
  setInput,
  input,
}: {
  model: TextModel | undefined;
  setInput: (input: string) => void;
  input: string;
}) => {
  const { add } = usePromptInputAttachments();

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;
    const items = clipboardData?.items;

    if (!items) return;
    if (!model?.capabilities?.includes('IMAGE')) return;

    // Process each item in the clipboard
    for (const item of Array.from(items)) {
      // Check if the item is a file
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (!file) continue;
        add([file]);
      }
    }
  };

  return (
    <PromptInputTextarea
      className="min-h-20"
      onChange={(e) => setInput(e.target.value)}
      onPaste={handlePaste}
      value={input}
    />
  );
};

const AppPromptInputToolbar = ({
  model,
  chatType,
  setModelAction,
  status,
  input,
}: {
  model: Doc<'chats'>['model'];
  chatType: Doc<'chats'>['type'];
  setModelAction: (model: Doc<'chats'>['model']) => void;
  status: ChatStatus;
  input: string;
}) => {
  const { openFileDialog } = usePromptInputAttachments();

  const addActiveTool = (tool: string) => {
    setModelAction({
      ...model,
      settings: {
        ...model?.settings,
        activeTools: [...(model?.settings?.activeTools ?? []), tool],
      },
    } as Doc<'chats'>['model']);
  };

  const removeActiveTool = (tool: string) => {
    setModelAction({
      ...model,
      settings: {
        ...model?.settings,
        activeTools: model?.settings?.activeTools?.filter((t) => t !== tool),
      },
    } as Doc<'chats'>['model']);
  };

  return (
    <PromptInputToolbar>
      <PromptInputTools>
        <ModelCombobox
          model={model ?? textModels[0]}
          setModelAction={setModelAction}
        />
        {model?.capabilities?.includes('TOOL_STREAMING') &&
          chatType === 'chat' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PromptInputButton
                    onClick={() => {
                      if (
                        model?.settings?.activeTools?.includes(
                          'image_generation'
                        )
                      ) {
                        removeActiveTool('image_generation');
                      } else {
                        addActiveTool('image_generation');
                      }
                    }}
                    variant={
                      model?.settings?.activeTools?.includes('image_generation')
                        ? 'outline'
                        : 'ghost'
                    }
                  >
                    <ImageIcon className="size-3.5" />
                    Image
                  </PromptInputButton>
                </TooltipTrigger>
                <TooltipContent>Enable Image Generation</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <PromptInputButton
                    onClick={() => {
                      if (
                        model?.settings?.activeTools?.includes(
                          'global_context_manager'
                        )
                      ) {
                        removeActiveTool('global_context_manager');
                      } else {
                        addActiveTool('global_context_manager');
                      }
                    }}
                    variant={
                      model?.settings?.activeTools?.includes(
                        'global_context_manager'
                      )
                        ? 'outline'
                        : 'ghost'
                    }
                  >
                    <BrainIcon className="size-3.5" />
                    GCM
                  </PromptInputButton>
                </TooltipTrigger>
                <TooltipContent>Enable Global Context Manager</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
      </PromptInputTools>
      <PromptInputButton
        className="mr-2 ml-auto size-7"
        onClick={openFileDialog}
      >
        <PaperclipIcon className="size-3.5" />
      </PromptInputButton>
      <PromptInputSubmit disabled={!input} status={status} />
    </PromptInputToolbar>
  );
};
