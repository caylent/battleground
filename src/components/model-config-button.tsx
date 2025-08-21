import { TooltipArrow } from '@radix-ui/react-tooltip';
import { Info, SlidersHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import type { ImageModel, VideoModel } from '@/lib/model/model.type';
import type { ConfigValue } from '@/lib/model/model-config.type';
import { Button } from './ui/button';
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
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type ConfigValueInputProps = {
  model: ImageModel | VideoModel;
  setting: ConfigValue;
  setModel: (model: ImageModel | VideoModel) => void;
  onEnter: () => void;
};

const ConfigValueInput = ({
  setting,
  model,
  setModel,
  onEnter,
}: ConfigValueInputProps) => {
  return (
    <div className="flex flex-col gap-1" key={setting.name}>
      <Label
        className="flex items-center gap-2 text-nowrap text-xs"
        htmlFor={setting.name}
      >
        {setting.label}
        {setting.description && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Info className="size-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent align="start" className="max-w-[300px] text-wrap">
              {setting.description}
            </TooltipContent>
          </Tooltip>
        )}
      </Label>
      {setting.type === 'enum' ? (
        <Select
          onValueChange={(value) => {
            setModel({
              ...model,
              config: model.config?.map((s) =>
                s.name === setting.name ? ({ ...s, value } as ConfigValue) : s
              ),
            });
          }}
          value={setting.value}
        >
          <SelectTrigger className="focus:ring-transparent">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {setting.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <>
          <Input
            className="focus-visible:ring-transparent"
            id={setting.name}
            max={setting.type === 'number' ? setting.max : undefined}
            min={setting.type === 'number' ? setting.min : undefined}
            onChange={(e) => {
              setModel({
                ...model,
                config: model.config?.map((s) =>
                  s.name === setting.name
                    ? ({ ...s, value: e.target.value } as ConfigValue)
                    : s
                ),
              });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEnter();
              }
            }}
            type="text"
            value={setting.value}
          />
          {setting.type === 'number' && (
            <p className="mr-2 text-right font-light text-[0.65rem] text-muted-foreground">
              {setting.min} - {setting.max}
            </p>
          )}
        </>
      )}
    </div>
  );
};

type ModelConfigButtonProps = {
  model: ImageModel | VideoModel;
  setModel: (model: ImageModel | VideoModel) => void;
};

export const ModelConfigButton = ({
  model,
  setModel,
}: ModelConfigButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild tabIndex={-1}>
            <Button size="xsicon" title="Model settings" variant="ghost">
              <SlidersHorizontalIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent className="text-xs" side="bottom">
          Configure inference parameters
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-2">
          {model.config?.map((setting) => (
            <ConfigValueInput
              key={setting.name}
              model={model}
              onEnter={() => setOpen(false)}
              setModel={setModel}
              setting={setting}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
