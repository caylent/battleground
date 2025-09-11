'use client';

import type { ChatStatus } from 'ai';
import {
  BrainIcon,
  ImageIcon,
  PaperclipIcon,
  SettingsIcon,
} from 'lucide-react';
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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
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

  const updateModelSetting = (settings: LocalModelSettings) => {
    setModelAction({
      ...model,
      settings: {
        activeTools: model?.settings?.activeTools ?? [],
        ...settings,
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
        <ModelSettings model={model} updateModelSetting={updateModelSetting} />
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
      {model?.capabilities?.includes('IMAGE') && (
        <PromptInputButton
          className="mr-2 ml-auto size-7"
          onClick={openFileDialog}
        >
          <PaperclipIcon className="size-3.5" />
        </PromptInputButton>
      )}
      <PromptInputSubmit disabled={!input} status={status} />
    </PromptInputToolbar>
  );
};

type LocalModelSettings = Partial<Doc<'chats'>['model']['settings']>;

const ModelSettings = ({
  model,
  updateModelSetting,
}: {
  model: Doc<'chats'>['model'];
  updateModelSetting: (settings: LocalModelSettings) => void;
}) => {
  const [localSettings, setLocalSettings] = useState<LocalModelSettings>({
    systemPrompt: model?.settings?.systemPrompt,
    temperature: model?.settings?.temperature,
    maxTokens: model?.settings?.maxTokens,
    reasoning: model?.settings?.reasoning,
  });

  const [isOpen, setIsOpen] = useState(false);

  // Update local settings when model changes
  useEffect(() => {
    setLocalSettings({
      systemPrompt: model?.settings?.systemPrompt,
      temperature: model?.settings?.temperature,
      maxTokens: model?.settings?.maxTokens,
      reasoning: model?.settings?.reasoning,
    });
  }, [model?.settings]);

  // Apply settings when popover closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      updateModelSetting(localSettings);
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange} open={isOpen}>
      <PopoverTrigger asChild>
        <PromptInputButton className="size-7" variant="ghost">
          <SettingsIcon className="size-3.5" />
        </PromptInputButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-120">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Model Settings</h4>
            <p className="text-muted-foreground text-xs">
              Adjust model settings and behavior
            </p>
          </div>

          <div className="space-y-4">
            {/* System Prompt */}
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                className="min-h-24"
                id="system-prompt"
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    systemPrompt: e.target.value || undefined,
                  })
                }
                placeholder="Enter system prompt..."
                value={localSettings?.systemPrompt ?? ''}
              />
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <p className="text-muted-foreground text-xs">
                Controls randomness (0 = deterministic, 2 = very creative)
              </p>
              <Input
                id="temperature"
                max="2"
                min="0"
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalSettings({
                    ...localSettings,
                    temperature: value ? Number.parseFloat(value) : undefined,
                  });
                }}
                step="0.1"
                type="number"
                value={localSettings?.temperature ?? ''}
              />
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <p className="text-muted-foreground text-xs">
                Maximum number of output tokens to generate
              </p>
              <Input
                id="max-tokens"
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalSettings({
                    ...localSettings,
                    maxTokens: value ? Number.parseInt(value, 10) : undefined,
                  });
                }}
                type="number"
                value={localSettings?.maxTokens ?? ''}
              />
            </div>

            {/* Reasoning */}
            {model?.capabilities?.includes('REASONING') && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Label>Reasoning</Label>
                  <Switch
                    checked={localSettings?.reasoning?.enabled ?? false}
                    className="inline-flex"
                    id="reasoning-enabled"
                    onCheckedChange={(checked) =>
                      setLocalSettings({
                        ...localSettings,
                        reasoning: {
                          ...localSettings?.reasoning,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>

                {localSettings?.reasoning?.enabled && (
                  <div className="space-y-2">
                    <Select
                      onValueChange={(value: 'low' | 'med' | 'high') =>
                        setLocalSettings({
                          ...localSettings,
                          reasoning: {
                            ...localSettings?.reasoning,
                            level: value,
                          },
                        })
                      }
                      value={localSettings.reasoning?.level ?? 'med'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select reasoning level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="med">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      Controls the reasoning effort
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
