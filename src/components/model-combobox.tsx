'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { type TextModel, textModels } from '@/lib/model/models';
import { cn } from '@/lib/utils';
import { getProviderIcon } from './provider-icons';

export function ModelCombobox({
  model,
  setModelAction,
  trigger,
}: {
  model: TextModel;
  setModelAction: (model: TextModel) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            aria-expanded={open}
            className="h-7 justify-between font-light text-xs"
            role="combobox"
            variant="ghost"
          >
            {getProviderIcon(model.provider)}
            {model.id
              ? textModels.find((m) => m.id === model.id)?.name
              : 'Select framework...'}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-fit p-0" side="top">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {textModels.map((m) => (
                <CommandItem
                  key={m.id}
                  onSelect={(currentValue) => {
                    setModelAction(
                      textModels.find((fm) => fm.id === currentValue) ??
                        textModels[0]
                    );
                    setOpen(false);
                  }}
                  value={m.id}
                >
                  {getProviderIcon(m.provider)}
                  {m.name}
                  <CheckIcon
                    className={cn(
                      'mr-2 ml-auto h-4 w-4',
                      model.id === m.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
