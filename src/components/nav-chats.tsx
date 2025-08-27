'use client';

import { type Preloaded, usePreloadedQuery } from 'convex/react';
import { Edit, MoreHorizontal, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { api } from '../../convex/_generated/api';
import { ChatMenuItem } from './chat-menu-item';

export function NavChats({
  preloadedChats,
}: {
  preloadedChats: Preloaded<typeof api.chats.getRecent>;
}) {
  const chats = usePreloadedQuery(preloadedChats);
  const router = useRouter();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => router.push('/chat')}>
            <Edit /> New Chat
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Search /> Search Chats
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {chats.length > 0 && <SidebarGroupLabel>Chats</SidebarGroupLabel>}
      <SidebarMenu>
        {chats.map((item) => (
          <ChatMenuItem chat={item} key={item._id} />
        ))}
        {chats.length > 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
