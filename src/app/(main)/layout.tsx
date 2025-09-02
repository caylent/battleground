import { Suspense } from 'react';
import { AppSidebar as NewAppSidebar } from '@/components/app-sidebar';
import ChatBackground from '@/components/backgrounds/chat-background';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ChatBackground>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '350px',
          } as React.CSSProperties
        }
      >
        <NewAppSidebar />
        <SidebarInset>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </ChatBackground>
  );
}
