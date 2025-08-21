import { Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type FileButtonProps = {
  files: File[];
  setFiles: (files: File[]) => void;
};

export function FileButton({ files, setFiles }: FileButtonProps) {
  return (
    <>
      <Label
        className="flex cursor-pointer items-center rounded-md p-2 hover:bg-muted"
        htmlFor="file-input"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Paperclip className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            Attach file
          </TooltipContent>
        </Tooltip>
      </Label>
      <Input
        className="hidden"
        id="file-input"
        multiple
        onChange={(e) => {
          if (!e.target.files) return;

          // check if any file exceeds 10mb
          if (
            Array.from(e.target.files).some((f) => f.size > 5 * 1024 * 1024)
          ) {
            toast.error('File size exceeds 5MB');
            return;
          }

          const oldFiles = Array.from(files ?? []);
          const newFiles = Array.from(e.target.files).filter(
            (f) => !oldFiles.find((of) => of.name === f.name)
          );
          setFiles([...oldFiles, ...newFiles]);
        }}
        type="file"
      />
    </>
  );
}
