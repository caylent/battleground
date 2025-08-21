'use client';

import { Loader2, PlusCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePrompts } from '@/hooks/use-prompt';
import { cn } from '@/lib/utils';

export function PromptSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('mode') ?? 'edit';

  const { data: prompts, isLoading, isError, refetch } = usePrompts();

  return (
    <div className="flex h-screen w-80 flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="font-semibold text-md">Prompts</h2>
        <div className="flex gap-1">
          {isError && (
            <Button onClick={() => refetch()} size="xsicon" variant="ghost">
              <RefreshCw className="size-5" />
              <span className="sr-only">Add new prompt</span>
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className="flex items-center gap-1"
                href="/prompt?mode=edit"
              >
                <Button size="xsicon" variant="ghost">
                  <PlusCircle className="size-5" />
                  <span className="sr-only">Add new prompt</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new prompt</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <div className="">
          <div className="mb-6" key="global">
            <ul>
              {isLoading && (
                <Loader2 className="mt-6 h-4 w-full animate-spin self-center" />
              )}
              {isError && (
                <p className="mt-6 text-center text-red-500 text-sm">
                  Failed to load prompts
                </p>
              )}
              {prompts?.map((prompt) => {
                const isActive = pathname === `/prompt/${prompt.id}`;
                return (
                  <li className="border-b" key={prompt.id}>
                    <Link
                      className={cn(
                        'block border-transparent border-l-8 p-3 transition-colors duration-200 hover:bg-muted',
                        isActive && 'border-primary/70 bg-muted'
                      )}
                      href={`/prompt/${prompt.id}?mode=${tab}`}
                    >
                      <div className="mb-1 font-medium">{prompt.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {prompt.description ?? '--'}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
