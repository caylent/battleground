import { TooltipArrow } from '@radix-ui/react-tooltip';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type SyncButtonProps = {
  synced: boolean;
  onClick: () => void;
};

export const SyncButton = ({ synced, onClick }: SyncButtonProps) => {
  return (
    <div className="flex flex-row items-center gap-2">
      {synced && (
        <Badge
          className="h-5 bg-green-200 font-light dark:bg-green-800"
          variant="outline"
        >
          Synced
        </Badge>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onClick} size="xsicon" variant="ghost">
            {synced ? <ToggleRight /> : <ToggleLeft />}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs" side="bottom">
          Sync chat messages with other models
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
