import { Suspense } from 'react';
import { PlaygroundLayout } from '@/components/playground-layout';
import { Toaster } from '@/components/ui/sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PlaygroundLayout>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      <Toaster />
    </PlaygroundLayout>
  );
}
