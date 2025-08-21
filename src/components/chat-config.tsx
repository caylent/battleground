'use client';

import { TooltipArrow } from '@radix-ui/react-tooltip';
import { ClipboardPaste, SlidersHorizontalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { TextModel } from '@/lib/model/model.type';
import type { ChatParams } from '@/stores/chat-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function ChatConfig({
  model,
  onConfigChange,
  onSynchronizeSystemPrompt,
}: {
  model: TextModel;
  onConfigChange: (config: ChatParams) => void;
  onSynchronizeSystemPrompt?: () => void;
}) {
  return (
    <Popover>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild tabIndex={-1}>
            <Button size="xsicon" title="Model settings" variant="ghost">
              <SlidersHorizontalIcon className="h-5 w-5" />
              <span className="sr-only">Open chat configuration</span>
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent className="text-xs" side="bottom">
          Configure chat parameters
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-96">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Chat Configuration</h4>
            <p className="text-muted-foreground text-sm">
              Adjust the parameters for the chat model.
            </p>
          </div>
          <div className="grid gap-2">
            <Label
              className="mb-2 flex items-center justify-between"
              htmlFor="systemPrompt"
            >
              System Prompt
              {onSynchronizeSystemPrompt && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={!model.systemPromptSupport}
                      onClick={onSynchronizeSystemPrompt}
                      size="xsicon"
                      variant="ghost"
                    >
                      <ClipboardPaste className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs" side="bottom">
                    Synchronize System Prompt
                  </TooltipContent>
                </Tooltip>
              )}
            </Label>
            <Textarea
              autoFocus
              disabled={!model.systemPromptSupport}
              id="systemPrompt"
              onChange={(e) => onConfigChange({ systemPrompt: e.target.value })}
              placeholder={
                model.systemPromptSupport
                  ? 'Enter system prompt...'
                  : 'System prompt not supported for this model'
              }
              value={model.config.systemPrompt}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <div className="flex items-center gap-2">
              <Slider
                className="flex-grow"
                id="maxTokens"
                max={model.config.maxTokens.max}
                min={model.config.maxTokens.min}
                onValueChange={(value) =>
                  onConfigChange({ maxTokens: value[0] })
                }
                step={1}
                value={[model.config.maxTokens.value]}
              />
              <Input
                className="w-28"
                max={2048}
                min={0}
                onChange={(e) =>
                  onConfigChange({ maxTokens: Number(e.target.value) })
                }
                type="number"
                value={model.config.maxTokens.value}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="temperature">Temperature</Label>
            <div className="flex items-center gap-2">
              <Slider
                className="flex-grow"
                id="temperature"
                max={model.config.temperature.max}
                min={model.config.temperature.min}
                onValueChange={(value) =>
                  onConfigChange({ temperature: value[0] })
                }
                step={0.01}
                value={[model.config.temperature.value]}
              />
              <Input
                className="w-28"
                max={2}
                min={0}
                onChange={(e) =>
                  onConfigChange({ temperature: Number(e.target.value) })
                }
                step={0.01}
                type="number"
                value={model.config.temperature.value.toFixed(2)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="topP">Top P</Label>
            <div className="flex items-center gap-2">
              <Slider
                className="flex-grow"
                id="topP"
                max={model.config.topP.max}
                min={model.config.topP.min}
                onValueChange={(value) => onConfigChange({ topP: value[0] })}
                step={0.01}
                value={[model.config.topP.value]}
              />
              <Input
                className="w-28"
                max={1}
                min={0}
                onChange={(e) =>
                  onConfigChange({ topP: Number(e.target.value) })
                }
                step={0.01}
                type="number"
                value={model.config.topP.value.toFixed(2)}
              />
            </div>
          </div>

          {model.config.reasoning && (
            <div className="grid gap-4" key="extended-thinking">
              <div className="flex flex-col gap-2">
                <Label>Extended Thinking</Label>
                <Select
                  onValueChange={(value) =>
                    onConfigChange({
                      reasoning: {
                        enabled: value === 'enabled',
                        budgetTokens:
                          model.config.reasoning?.budgetTokens?.value || 1024,
                      },
                    })
                  }
                  value={
                    model.config.reasoning.enabled ? 'enabled' : 'disabled'
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {model.config.reasoning.enabled && (
                <div className="grid gap-2">
                  <Label htmlFor="budgetTokens">Budget Tokens</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      className="flex-grow"
                      id="budgetTokens"
                      max={model.config.reasoning?.budgetTokens?.max}
                      min={model.config.reasoning?.budgetTokens?.min}
                      onValueChange={(value) =>
                        onConfigChange({
                          reasoning: {
                            budgetTokens: value[0],
                            enabled: !!model.config.reasoning?.enabled,
                          },
                        })
                      }
                      step={1}
                      value={[model.config.reasoning?.budgetTokens?.value]}
                    />
                    <Input
                      className="w-28"
                      max={model.config.reasoning?.budgetTokens?.max}
                      min={model.config.reasoning?.budgetTokens?.min}
                      onChange={(e) =>
                        onConfigChange({
                          reasoning: {
                            budgetTokens: Number(e.target.value),
                            enabled: !!model.config.reasoning?.enabled,
                          },
                        })
                      }
                      step={1}
                      type="number"
                      value={model.config.reasoning?.budgetTokens?.value}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
