'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getProviderIcon } from '@/lib/get-provider-icon';
import type { TextModel } from '@/lib/model/model.type';
import { cn } from '@/lib/utils';

type ModelSelectProps = {
  models: TextModel[];
  selectedModelId: string;
  onChange: (modelId: string) => void;
};

export function ModelSelect({
  selectedModelId,
  models,
  onChange,
}: ModelSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedModel = models.find((model) => model.id === selectedModelId);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="h-8 w-[280px] justify-between p-2"
          variant="outline"
        >
          {selectedModel && (
            <Image
              alt={selectedModel.provider ?? 'Unkonwn'}
              height={16}
              src={getProviderIcon(selectedModel.provider)}
              width={16}
            />
          )}
          <p className="truncate font-normal text-xs">
            {selectedModel?.name ?? 'Select model...'}
          </p>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[380px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandList>
            {models.map((model) => (
              <CommandItem
                className="flex flex-row items-center gap-2 rounded-none text-xs"
                key={model.id}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
                value={model.id}
              >
                <Image
                  alt={model.name ?? 'Unkonwn'}
                  height={16}
                  src={getProviderIcon(model.provider)}
                  width={16}
                />
                <div className="flex flex-col gap-1">
                  <div>{model.name}</div>
                  <div className="font-light text-gray-400 text-xs">
                    {model.id}
                  </div>
                </div>
                <div className="m-auto" />
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedModelId === model.id
                      ? 'text-muted-foreground'
                      : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
