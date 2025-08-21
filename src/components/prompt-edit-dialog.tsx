import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePrompt, useSavePrompt, useUpdatePrompt } from '@/hooks/use-prompt';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type PromptEditDialogProps = {
  promptId?: string;
  promptText?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PromptEditDialog = ({
  promptId,
  promptText,
  open,
  onOpenChange,
}: PromptEditDialogProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: prompt } = usePrompt({ id: promptId });

  useEffect(() => {
    if (!prompt) return;
    setName(prompt.name ?? '');
    setDescription(prompt.description ?? '');
  }, [prompt]);

  const savePrompt = useSavePrompt({
    onSuccess: (data) => {
      router.replace(`/prompt/${data.id}?mode=edit`);
      toast.success('Prompt created');
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePrompt = useUpdatePrompt({
    onSuccess: () => toast.success('Prompt updated'),
    onError: (error) => toast.error(error.message),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Prompt Details</DialogTitle>
          <DialogDescription>
            Update the name, description, and scope of your prompt.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <Label htmlFor="description">Description</Label>
          <Textarea
            className="resize-none"
            id="description"
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            value={description}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => {
                if (promptId) {
                  updatePrompt.mutate({
                    id: promptId,
                    name,
                    description,
                    prompt: promptText ?? '',
                    user: user?.primaryEmailAddress?.emailAddress,
                  });
                } else {
                  savePrompt.mutate({
                    name,
                    description,
                    prompt: promptText ?? '',
                    user: user?.primaryEmailAddress?.emailAddress,
                  });
                }
              }}
              size="sm"
              variant="default"
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
