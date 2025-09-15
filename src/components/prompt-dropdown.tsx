'use client';

import { useMutation, useQuery } from 'convex/react';
import { BookmarkIcon, FileDownIcon, SaveIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { PromptInputButton } from '@/components/ai-elements/prompt-input';
import { SavePromptDialog } from '@/components/save-prompt-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '../../convex/_generated/api';

export type PromptDropdownProps = {
  currentPrompt: string;
  onLoadPromptAction: (prompt: string) => void;
};

export const PromptDropdown = ({
  currentPrompt,
  onLoadPromptAction,
}: PromptDropdownProps) => {
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');

  // Convex queries and mutations
  const prompts = useQuery(api.prompts.list);
  const deletePrompt = useMutation(api.prompts.remove);

  const handleLoadPrompt = (prompt: string) => {
    onLoadPromptAction(prompt);
    setLoadDialogOpen(false);
  };

  const handleDeletePrompt = async () => {
    if (!selectedPromptId) return;

    try {
      await deletePrompt({ id: selectedPromptId as any });
      setDeleteDialogOpen(false);
      setSelectedPromptId('');
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const confirmDelete = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPromptId(promptId);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PromptInputButton className="size-7" variant="ghost">
            <BookmarkIcon className="size-3.5" />
          </PromptInputButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <SavePromptDialog
            disabled={!currentPrompt.trim()}
            prompt={currentPrompt}
          >
            <DropdownMenuItem
              disabled={!currentPrompt.trim()}
              onSelect={(e) => e.preventDefault()}
            >
              <SaveIcon className="size-4" />
              Save Prompt
            </DropdownMenuItem>
          </SavePromptDialog>

          <DropdownMenuItem onSelect={() => setLoadDialogOpen(true)}>
            <FileDownIcon className="size-4" />
            Load Prompt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Load Prompt Dialog */}
      <Dialog onOpenChange={setLoadDialogOpen} open={loadDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Load Prompt</DialogTitle>
          </DialogHeader>
          <div className="scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent max-h-80 space-y-3 overflow-y-auto">
            {prompts?.length ? (
              <div className="space-y-1.5">
                {prompts.map((prompt) => (
                  <div
                    className="flex items-center justify-between rounded-md border p-2.5 hover:bg-muted/50"
                    key={prompt._id}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="truncate pr-2 font-medium text-sm">
                          {prompt.name}
                        </h4>
                        <div className="flex shrink-0 items-center space-x-1">
                          <Button
                            className="h-7 px-2 text-xs"
                            onClick={() => handleLoadPrompt(prompt.prompt)}
                            size="sm"
                            variant="outline"
                          >
                            Load
                          </Button>
                          <Button
                            className="h-7 w-7 p-0"
                            onClick={(e) => confirmDelete(prompt._id, e)}
                            size="sm"
                            variant="ghost"
                          >
                            <TrashIcon className="size-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="line-clamp-1 text-muted-foreground text-xs">
                        {prompt.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <BookmarkIcon className="mx-auto mb-3 size-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  No saved prompts yet
                </p>
                <p className="text-muted-foreground text-xs">
                  Save your current prompt to get started
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setLoadDialogOpen(false)}
              size="sm"
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prompt? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePrompt}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
