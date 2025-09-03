'use client';

import {
  ArchiveIcon,
  FileAudioIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  XIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export type AttachmentProps = {
  src?: string;
  alt: string;
  className?: string;
  filename: string;
  contentType: string;
  onDeleteAction?: () => void;
};

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) {
    return FileImageIcon;
  }
  if (contentType.startsWith('video/')) {
    return FileVideoIcon;
  }
  if (contentType.startsWith('audio/')) {
    return FileAudioIcon;
  }
  if (
    contentType.startsWith('text/') ||
    contentType.includes('json') ||
    contentType.includes('xml')
  ) {
    return FileTextIcon;
  }
  if (
    contentType.includes('zip') ||
    contentType.includes('archive') ||
    contentType.includes('compressed')
  ) {
    return ArchiveIcon;
  }
  return FileIcon;
}

export function Attachment({
  src,
  filename,
  alt,
  contentType,
  onDeleteAction,
}: AttachmentProps) {
  const IconComponent = getFileIcon(contentType);
  const isImage = contentType.startsWith('image/');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge
          className="max-w-[150px] cursor-pointer gap-2 rounded-md px-2 py-1 transition-all duration-200 hover:scale-105 hover:shadow-md"
          variant="outline"
        >
          {isImage && src ? (
            <Image
              alt={alt}
              className="h-4 w-4 shrink-0 rounded-md"
              height={16}
              src={src}
              unoptimized
              width={16}
            />
          ) : (
            <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-foreground text-sm">{filename}</span>
          {onDeleteAction && (
            <button
              aria-label="Delete"
              className="-my-[5px] -ms-0.5 -me-2 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-foreground/60 outline-none transition-[color,box-shadow] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteAction?.();
              }}
              type="button"
            >
              <XIcon aria-hidden="true" size={14} />
            </button>
          )}
        </Badge>
      </DialogTrigger>

      <DialogContent className="h-fit min-w-[60vw] p-2">
        <DialogHeader>
          <DialogTitle className="pt-2 pl-2 text-sm">{filename}</DialogTitle>
        </DialogHeader>
        <div className="relative flex h-full w-full items-center justify-center">
          {isImage && src ? (
            <Image
              alt={alt}
              className="h-full w-full object-contain"
              height={2048}
              src={src}
              unoptimized
              width={2048}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 p-8">
              <IconComponent className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">{filename}</p>
                <p className="text-muted-foreground text-sm">{contentType}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
