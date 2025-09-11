import { Suspense } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileNotSupportedOverlay } from '@/components/mobile-not-supported-overlay';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider open={false}>
      <AppSidebar />
      <SidebarInset>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <MobileNotSupportedOverlay />
      </SidebarInset>
    </SidebarProvider>
  );
}
