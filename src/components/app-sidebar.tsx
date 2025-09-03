import { preloadQuery } from 'convex/nextjs';
import { GithubIcon } from 'lucide-react';
import Link from 'next/link';
import type * as React from 'react';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { api } from '../../convex/_generated/api';
import { Logo } from './logo';
import { NavChats } from './nav-chats';
import { NavMain } from './nav-main';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const preloadedChats = await preloadQuery(api.chats.getRecent, { limit: 10 });

  return (
    <Sidebar
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      collapsible="icon"
      variant="floating"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        className="w-[calc(var(--sidebar-width-icon)+1px)]! rounded-l-md border-r-0 bg-white/30 group-data-[state=expanded]:border-r group-data-[state=expanded]:border-r-sidebar-border dark:bg-white/10"
        collapsible="none"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="mt-2 flex items-center justify-center">
              <Logo className="size-6 fill-primary" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuButton asChild>
            <Button
              asChild
              className="text-foreground hover:bg-gray-100! hover:text-[var(--sidebar-accent-foreground)] dark:hover:bg-[var(--sidebar-accent)]!"
              size="icon"
              variant="ghost"
            >
              <Link
                href="https://github.com/caylent/battleground"
                target="_blank"
              >
                <GithubIcon className="size-4" />
              </Link>
            </Button>
          </SidebarMenuButton>
          <SidebarMenuButton asChild>
            <ThemeToggle />
          </SidebarMenuButton>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar
        className="hidden flex-1 rounded-r-md bg-white/20 md:flex dark:bg-white/5"
        collapsible="none"
      >
        <SidebarContent>
          <NavChats preloadedChats={preloadedChats} />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </Sidebar>
  );
}
