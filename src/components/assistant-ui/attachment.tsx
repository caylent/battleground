'use client';

import {
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAttachment,
} from '@assistant-ui/react';
import { DialogContent as DialogPrimitiveContent } from '@radix-ui/react-dialog';
import { CircleXIcon, FileIcon, PaperclipIcon } from 'lucide-react';
import { type FC, type PropsWithChildren, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const useFileSrc = (file: File | undefined) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setSrc(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return src;
};

const useAttachmentSrc = () => {
  const { file, src } = useAttachment(
    useShallow((a): { file?: File; src?: string } => {
      console.log(a);
      if (a.file) return { file: a.file };
      if (a.name.startsWith('data:')) return { src: a.name };
      if (a.name.startsWith('attachments/')) {
        const origin = window.location.origin;
        return { src: `/api/${a.name}` };
      }
      const src = a.content?.filter((c) => c.type === 'image')[0]?.image;
      if (!src) return {};
      return { src };
    })
  );

  return useFileSrc(file) ?? src;
};

type AttachmentPreviewProps = {
  src: string;
};

const AttachmentPreview: FC<AttachmentPreviewProps> = ({ src }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    // biome-ignore lint/performance/noImgElement: Ignore
    // biome-ignore lint/nursery/useImageSize: Ignore
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Ignore
    <img
      alt="Preview"
      onLoad={() => setIsLoaded(true)}
      src={src}
      style={{
        width: 'auto',
        height: 'auto',
        maxWidth: '75dvh',
        maxHeight: '75dvh',
        display: isLoaded ? 'block' : 'none',
        overflow: 'clip',
      }}
    />
  );
};

const AttachmentPreviewDialog: FC<PropsWithChildren> = ({ children }) => {
  const src = useAttachmentSrc();

  if (!src) return children;

  return (
    <Dialog>
      <DialogTrigger
        asChild
        className="cursor-pointer transition-colors hover:bg-accent/50"
      >
        {children}
      </DialogTrigger>
      <AttachmentDialogContent>
        <DialogTitle className="sr-only">Image Attachment Preview</DialogTitle>
        <AttachmentPreview src={src} />
      </AttachmentDialogContent>
    </Dialog>
  );
};

const AttachmentThumb: FC = () => {
  const isImage = useAttachment((a) => a.type === 'image');
  const src = useAttachmentSrc();
  return (
    <Avatar className="flex size-10 items-center justify-center rounded-sm border bg-muted text-sm">
      <AvatarFallback delayMs={isImage ? 200 : 0}>
        <FileIcon />
      </AvatarFallback>
      <AvatarImage src={src} />
    </Avatar>
  );
};

const AttachmentUI: FC = () => {
  const canRemove = useAttachment((a) => a.source !== 'message');
  return (
    <Tooltip>
      <AttachmentPrimitive.Root className="relative mt-2">
        <AttachmentPreviewDialog>
          <TooltipTrigger asChild>
            <div className="flex h-12 w-40 items-center justify-center gap-2 rounded-lg border px-0.75 py-1">
              <AttachmentThumb />
              <div className="flex-grow basis-0">
                <p className="line-clamp-1 text-ellipsis break-all font-bold text-muted-foreground text-xs">
                  <AttachmentPrimitive.Name />
                </p>
              </div>
            </div>
          </TooltipTrigger>
        </AttachmentPreviewDialog>
        {canRemove && <AttachmentRemove />}
      </AttachmentPrimitive.Root>
      <TooltipContent side="top">
        <AttachmentPrimitive.Name />
      </TooltipContent>
    </Tooltip>
  );
};

const AttachmentRemove: FC = () => {
  return (
    <AttachmentPrimitive.Remove asChild>
      <TooltipIconButton
        className="-right-3 -top-3 absolute size-6 text-muted-foreground [&>svg]:size-4 [&>svg]:rounded-full [&>svg]:bg-background"
        side="top"
        tooltip="Remove file"
      >
        <CircleXIcon />
      </TooltipIconButton>
    </AttachmentPrimitive.Remove>
  );
};

export const UserMessageAttachments: FC = () => {
  return (
    <div className="col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-3">
      <MessagePrimitive.Attachments components={{ Attachment: AttachmentUI }} />
    </div>
  );
};

export const ComposerAttachments: FC = () => {
  return (
    <div className="flex w-full flex-row gap-3 overflow-x-auto px-2">
      <ComposerPrimitive.Attachments
        components={{ Attachment: AttachmentUI }}
      />
    </div>
  );
};

export const ComposerAddAttachment: FC = () => {
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <TooltipIconButton
        className="size-7 p-2 transition-opacity ease-in"
        tooltip="Add Attachment"
        variant="outline"
      >
        <PaperclipIcon />
      </TooltipIconButton>
    </ComposerPrimitive.AddAttachment>
  );
};

const AttachmentDialogContent: FC<PropsWithChildren> = ({ children }) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitiveContent className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
      {children}
    </DialogPrimitiveContent>
  </DialogPortal>
);
