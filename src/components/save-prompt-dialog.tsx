'use client';

import { useMutation } from 'convex/react';
import { SaveIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '../../convex/_generated/api';

export type SavePromptDialogProps = {
  children?: React.ReactNode;
  prompt: string;
  disabled?: boolean;
  onSaveSuccess?: () => void;
};

export const SavePromptDialog = ({
  children,
  prompt,
  disabled = false,
  onSaveSuccess,
}: SavePromptDialogProps) => {
  const [open, setOpen] = useState(false);
  const [promptName, setPromptName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const createPrompt = useMutation(api.prompts.create);

  const handleSave = async () => {
    if (!promptName.trim()) return;
    if (!prompt.trim()) return;

    setIsSaving(true);
    try {
      await createPrompt({
        name: promptName.trim(),
        prompt,
      });
      setPromptName('');
      setOpen(false);
      onSaveSuccess?.();
    } catch (error) {
      console.error('Failed to save prompt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setPromptName('');
      setIsSaving(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild disabled={disabled}>
        {children || (
          <Button disabled={disabled} size="sm" variant="outline">
            <SaveIcon className="size-4" />
            Save Prompt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-name">Prompt Name</Label>
            <Input
              id="prompt-name"
              onChange={(e) => setPromptName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaving) {
                  handleSave();
                }
              }}
              placeholder="Enter a name for this prompt..."
              value={promptName}
            />
          </div>
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="max-h-32 overflow-y-auto rounded-md bg-muted p-3 text-sm">
              {prompt || 'No prompt to save'}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              disabled={isSaving}
              onClick={() => handleOpenChange(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!(promptName.trim() && prompt.trim()) || isSaving}
              onClick={handleSave}
            >
              {isSaving ? 'Saving...' : 'Save Prompt'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
