import { ChatBackground } from '@/components/backgrounds/chat-background';
import { Toaster } from '@/components/ui/sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ChatBackground>
      {children}
      <Toaster />
    </ChatBackground>
  );
}
