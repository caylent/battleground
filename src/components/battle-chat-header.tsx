import { useAuth } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { MinusIcon, MoreHorizontal, PlusIcon } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { ModelCombobox } from './model-combobox';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const BattleChatHeader = ({
  chat,
  onExportResultsAction,
}: {
  chat: Doc<'chats'>;
  onExportResultsAction?: () => void;
}) => {
  const { userId } = useAuth();
  const createChat = useMutation(api.chats.create);
  const deleteChat = useMutation(api.chats.remove);
  const updateChat = useMutation(api.chats.update);
  const clearBattleChats = useMutation(api.chats.clearBattleChats);

  return (
    <div className="-m-2 mb-2 flex items-center rounded-t-lg bg-foreground/10 p-2">
      <span className="mr-auto font-light text-foreground/90 text-sm">
        {chat.model?.name}
      </span>
      <div className="flex items-center gap-2">
        <ModelCombobox
          model={chat.model}
          setModelAction={async (model) => {
            await createChat({
              name: 'New Chat',
              model,
              userId: userId ?? '',
              type: 'battle',
            });
          }}
          trigger={
            <Button
              className="size-7 hover:bg-white/10!"
              size="icon"
              variant="ghost"
            >
              <PlusIcon className="size-4" />
            </Button>
          }
        />
        <Button
          className="size-7 hover:bg-white/10!"
          onClick={() => deleteChat({ id: chat._id })}
          size="icon"
          variant="ghost"
        >
          <MinusIcon className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="size-7 hover:bg-white/10!"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem
              onClick={() => updateChat({ id: chat._id, messages: [] })}
            >
              <span>Clear chat</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => clearBattleChats({ userId: userId ?? '' })}
            >
              <span>Clear all chats</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportResultsAction}>
              <span>Export Results</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
