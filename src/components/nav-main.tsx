'use client';

import {
  MessageCircleIcon,
  Settings2Icon,
  SparklesIcon,
  SwordsIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Battle',
    url: '/battle',
    icon: SwordsIcon,
  },
  {
    title: 'Chat',
    url: '/chat',
    icon: MessageCircleIcon,
  },
  {
    title: 'Elements',
    url: '/elements',
    icon: SparklesIcon,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings2Icon,
  },
];

export function NavMain() {
  const pathname = usePathname();

  const isActive = (url: string) => pathname.startsWith(url);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              className={cn(isActive(item.url) && 'bg-sidebar-accent')}
              tooltip={item.title}
            >
              <Link href={item.url as any}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
