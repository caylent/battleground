import { useAuth } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { ModelCombobox } from './model-combobox';
import { Button } from './ui/button';

export const BattleChatHeader = ({ chat }: { chat: Doc<'chats'> }) => {
  const { userId } = useAuth();
  const createChat = useMutation(api.chats.create);
  const deleteChat = useMutation(api.chats.remove);

  return (
    <div className="-m-2 flex items-center rounded-t-lg bg-white/5 p-2">
      <span className="mr-auto text-sm text-white/50">{chat.model?.name}</span>
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
      </div>
    </div>
  );
};
