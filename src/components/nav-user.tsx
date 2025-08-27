import { UserButton } from '@clerk/nextjs';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="mx-auto">
        <UserButton />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
