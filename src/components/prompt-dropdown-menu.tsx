import { useUser } from '@clerk/nextjs';
import { Edit2, MoreHorizontal, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDeletePrompt,
  usePrompt,
  useUpdatePrompt,
} from '@/hooks/use-prompt';
import { ConfirmDialog } from './confirm-dialog';
import { PromptEditDialog } from './prompt-edit-dialog';

export function PromptDropdownMenu({
  promptId,
  promptText,
}: {
  promptId?: string;
  promptText?: string;
}) {
  const router = useRouter();
  const { user } = useUser();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: prompt } = usePrompt({ id: promptId });

  const updatePrompt = useUpdatePrompt({
    onSuccess: () => toast.success('Prompt saved'),
    onError: (error) => toast.error(error.message),
  });

  const deletePrompt = useDeletePrompt({
    onSuccess: () => {
      toast.success('Prompt deleted successfully');
      router.replace('/prompt?mode=edit');
    },
    onError: (error) => toast.error(error.message ?? 'Failed to delete prompt'),
  });

  const handleSave = useCallback(() => {
    if (promptId) {
      updatePrompt.mutate({
        id: promptId,
        name: prompt?.name ?? '',
        description: prompt?.description ?? '',
        prompt: promptText ?? '',
        user: user?.primaryEmailAddress?.emailAddress,
      });
    } else {
      setEditDialogOpen(true);
    }
  }, [promptId, prompt, promptText, user, updatePrompt]);

  useHotkeys('mod+s, ctrl+s', () => handleSave(), {
    preventDefault: true,
    enableOnContentEditable: true,
    enableOnFormTags: ['INPUT', 'TEXTAREA'],
  });
  useHotkeys('mod+e, ctrl+e', () => setEditDialogOpen(true), {
    preventDefault: true,
    enableOnContentEditable: true,
    enableOnFormTags: ['INPUT', 'TEXTAREA'],
  });
  useHotkeys('mod+d, ctrl+d', () => setDeleteDialogOpen(true), {
    preventDefault: true,
    enableOnContentEditable: true,
    enableOnFormTags: ['INPUT', 'TEXTAREA'],
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            <span className="mr-4">Edit Info</span>
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>{' '}
          <DropdownMenuItem onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            <span className="mr-4">Save</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            disabled={!promptId}
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="mr-4">Delete</span>
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PromptEditDialog
        onOpenChange={setEditDialogOpen}
        open={editDialogOpen}
        promptId={promptId}
        promptText={promptText}
      />
      <ConfirmDialog
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={() => deletePrompt.mutate({ id: promptId ?? '' })}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        text="Are you sure you want to delete this prompt?"
        title="Delete Prompt"
      />
    </>
  );
}
