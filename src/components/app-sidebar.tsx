'use client';

import { Edit, GithubIcon, MessageCircle, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type * as React from 'react';
import { type NavLink, NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

const navItems: NavLink[] = [
  {
    title: 'Battle',
    url: '/battle',
    icon: MessageCircle,
  },
  {
    title: 'Chat',
    url: '/chat',
    icon: Edit,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          className="data-[state=open]:bg-foreground data-[state=open]:text-background"
          size="lg"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-800 text-lime-500">
            <Image
              alt="Battleground"
              className="size-5"
              height={20}
              src="/battle.png"
              width={20}
            />
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <Button size="icon" variant="ghost">
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
      <SidebarRail />
    </Sidebar>
  );
}
