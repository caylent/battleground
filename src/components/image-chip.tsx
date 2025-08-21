import { X } from 'lucide-react';
import Image from 'next/image';
import type { ImageData } from '@/types/image-data.type';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

type ImageChipProps = ImageData & {
  canRemove?: boolean;
  onRemove?: (name: string) => void;
};

export const ImageChip = ({
  name,
  dataUrl,
  canRemove,
  onRemove,
}: ImageChipProps) => {
  return (
    <HoverCard closeDelay={0} openDelay={0}>
      <HoverCardTrigger>
        <Badge
          className="flex max-w-[120px] cursor-pointer items-center gap-1.5 leading-none"
          key={name}
        >
          <span className="overflow-x-hidden text-ellipsis whitespace-nowrap py-0.5">
            {name}
          </span>
          {canRemove && (
            <Button
              className="h-4 w-4"
              onClick={() => onRemove?.(name)}
              size="icon"
              variant="ghost"
            >
              <X />
            </Button>
          )}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent align="start" side="top">
        <Image alt={name} height={200} src={dataUrl} width={200} />
      </HoverCardContent>
    </HoverCard>
  );
};
