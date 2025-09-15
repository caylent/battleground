'use client';

import { BrainIcon, ImageIcon, WrenchIcon } from 'lucide-react';
import { PromptInputButton } from '@/components/ai-elements/prompt-input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Doc } from '../../convex/_generated/dataModel';

export type ToolTogglesProps = {
  model: Doc<'chats'>['model'];
  chatType: Doc<'chats'>['type'];
  addActiveToolAction: (tool: string) => void;
  removeActiveToolAction: (tool: string) => void;
};

const toolsConfig = [
  {
    id: 'image_generation',
    label: 'Image Generation',
    icon: ImageIcon,
    tooltip: 'Enable Image Generation',
  },
  {
    id: 'global_context_manager',
    label: 'Global Context Manager',
    icon: BrainIcon,
    tooltip: 'Enable Global Context Manager',
  },
];

export const ToolToggles = ({
  model,
  chatType,
  addActiveToolAction,
  removeActiveToolAction,
}: ToolTogglesProps) => {
  const activeTools = model?.settings?.activeTools ?? [];
  const activeCount = activeTools.length;

  // Don't render if model doesn't support tool streaming or it's not a chat
  if (!model?.capabilities?.includes('TOOL_STREAMING') || chatType !== 'chat') {
    return null;
  }

  const toggleTool = (toolId: string) => {
    if (activeTools.includes(toolId)) {
      removeActiveToolAction(toolId);
    } else {
      addActiveToolAction(toolId);
    }
  };

  return (
    <>
      {/* Desktop: Show individual buttons */}
      {/* <div className="hidden md:contents">
        <TooltipProvider>
          {toolsConfig.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTools.includes(tool.id);

            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <PromptInputButton
                    onClick={() => toggleTool(tool.id)}
                    variant={isActive ? 'outline' : 'ghost'}
                  >
                    <Icon className="size-3.5" />
                    {tool.label}
                  </PromptInputButton>
                </TooltipTrigger>
                <TooltipContent>{tool.tooltip}</TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div> */}

      {/* Mobile: Show dropdown */}
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <PromptInputButton className="relative size-7" variant="ghost">
              <WrenchIcon className="size-3.5" />
              {activeCount > 0 && (
                <Badge
                  className="-right-1 -top-1 absolute size-4 bg-primary p-0 text-[10px] text-primary-foreground"
                  variant="secondary"
                >
                  {activeCount}
                </Badge>
              )}
            </PromptInputButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {toolsConfig.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTools.includes(tool.id);

              return (
                <DropdownMenuCheckboxItem
                  checked={isActive}
                  key={tool.id}
                  onCheckedChange={() => toggleTool(tool.id)}
                >
                  <Icon className="size-4" />
                  {tool.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
