'use client';

import type { ToolUIPart } from 'ai';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BorderBeam } from './magicui/border-beam';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export type StatefulImageProps = {
  src?: string;
  alt: string;
  className?: string;
  state?: ToolUIPart['state'];
};

export function StatefulImage({
  src,
  alt,
  className,
  state,
}: StatefulImageProps) {
  return (
    <div
      className={cn(
        'relative my-2 size-40 overflow-hidden rounded-lg bg-muted',
        className
      )}
    >
      {state === 'input-streaming' ||
        (state === 'input-available' && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="flex flex-col items-center text-sm">
              Generating image...
              <BorderBeam />
            </div>
          </div>
        ))}

      {state === 'output-error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <AlertCircle className="h-6" />
            <span className="text-sm">Image generation failed</span>
          </div>
        </div>
      )}

      {state === 'output-available' && src && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative h-full w-full cursor-pointer rounded-lg transition-all hover:border hover:border-primary hover:opacity-90">
              <Image
                alt={alt}
                className="h-full w-full rounded-lg object-cover"
                height={512}
                src={src}
                unoptimized
                width={512}
              />
            </div>
          </DialogTrigger>
          <DialogContent className="h-fit min-w-[60vw] p-2">
            <DialogHeader>
              <DialogTitle className="pt-2 pl-2 text-sm">{alt}</DialogTitle>
            </DialogHeader>
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                alt={alt}
                className="h-full w-full object-contain"
                height={2048}
                src={src}
                unoptimized
                width={2048}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
