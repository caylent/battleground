import type { FileUIPart, UIMessage } from 'ai';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ArchiveIcon,
  FileAudioIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  PaperclipIcon,
} from 'lucide-react';
import Image from 'next/image';
import type { ComponentProps, HTMLAttributes } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role'];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex w-full items-end justify-end gap-2 py-5',
      from === 'user' ? 'is-user' : 'is-assistant flex-row-reverse justify-end',
      className
    )}
    {...props}
  />
);

const messageContentVariants = cva(
  'is-user:dark flex flex-col gap-2 overflow-hidden rounded-lg text-sm',
  {
    variants: {
      variant: {
        contained: [
          'max-w-[80%] px-4 py-3',
          'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground',
          'group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground',
          'group-[.is-assistant]:max-w-full',
        ],
        flat: [
          'group-[.is-user]:max-w-[80%] group-[.is-user]:bg-primary/40 group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground',
          'group-[.is-assistant]:text-foreground',
          'group-[.is-assistant]:max-w-full',
        ],
      },
    },
    defaultVariants: {
      variant: 'contained',
    },
  }
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>;

export const MessageContent = ({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(messageContentVariants({ variant, className }))}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn('size-8 ring-1 ring-border', className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || 'ME'}</AvatarFallback>
  </Avatar>
);

export type MessageAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: FileUIPart & { id: string };
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

export const MessageAttachment = ({
  data,
  className,
  ...props
}: MessageAttachmentProps) => {
  const IconComponent = getFileIcon(data.mediaType);
  const isImage = data.mediaType.startsWith('image/');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={cn(
            'group relative h-14 w-14 rounded-md border hover:scale-105',
            className
          )}
          key={data.id}
          {...props}
        >
          {data.mediaType?.startsWith('image/') && data.url ? (
            <Image
              alt={data.filename || 'attachment'}
              className="size-full rounded-md object-cover"
              height={56}
              src={data.url}
              unoptimized
              width={56}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <PaperclipIcon className="size-4" />
            </div>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="h-fit min-w-[60vw] p-2">
        <DialogHeader>
          <DialogTitle className="pt-2 pl-2 text-sm">
            {data.filename}
          </DialogTitle>
        </DialogHeader>
        <div className="relative flex h-full w-full items-center justify-center">
          {isImage && data.url ? (
            <Image
              alt={data.filename || 'attachment'}
              className="h-full w-full object-contain"
              height={2048}
              src={data.url}
              unoptimized
              width={2048}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 p-8">
              <IconComponent className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">{data.filename}</p>
                <p className="text-muted-foreground text-sm">
                  {data.mediaType}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
