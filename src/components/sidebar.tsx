import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from './ui/sidebar';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="flex flex-row items-center gap-2">
        <Image
          alt="Bedrock Playground"
          className="size-8"
          height={32}
          src="/battle.png"
          width={32}
        />
        Battleground
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Test</SidebarGroupLabel>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
