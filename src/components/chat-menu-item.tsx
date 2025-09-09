'use client';

import { useMutation } from 'convex/react';
import {
  ArchiveIcon,
  ArrowUpRight,
  LinkIcon,
  MoreHorizontal,
  StarIcon,
  StarOff,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar';

export function ChatMenuItem({ chat }: { chat: Doc<'chats'> }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  const updateChat = useMutation(api.chats.update);
  const handleDelete = useMutation(api.chats.remove);

  return (
    <SidebarMenuItem key={chat._id}>
      <SidebarMenuButton asChild isActive={isActive(`/chat/${chat._id}`)}>
        <Link href={`/chat/${chat._id}`} prefetch title={chat.name}>
          <span>{chat.name}</span>
        </Link>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover>
            <MoreHorizontal />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isMobile ? 'end' : 'start'}
          className="w-56 rounded-lg"
          side={isMobile ? 'bottom' : 'right'}
        >
          {chat.isFavorite ? (
            <DropdownMenuItem
              onClick={() => updateChat({ id: chat._id, isFavorite: false })}
            >
              <StarOff className="text-muted-foreground" />
              <span>Remove from Favorites</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => updateChat({ id: chat._id, isFavorite: true })}
            >
              <StarIcon className="text-muted-foreground" />
              <span>Add to Favorites</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArrowUpRight className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => updateChat({ id: chat._id, isArchived: true })}
          >
            <ArchiveIcon className="text-muted-foreground" />
            <span>Archive</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              handleDelete({ id: chat._id });
              if (isActive(`/chat/${chat._id}`)) {
                router.push('/chat');
              }
            }}
          >
            <Trash2 className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
