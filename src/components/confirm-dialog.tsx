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

type ConfirmDialogProps = {
  title: string;
  text: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  title,
  text,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="py-2">{text}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onCancel} size="sm" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onConfirm} size="sm" variant="default">
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
