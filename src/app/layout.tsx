import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { ConvexClientProvider } from '@/components/convex-client-provider';
import { ThemeProvider } from './theme-provider';

export const metadata: Metadata = {
  title: 'Bedrock Playground',
  description: 'Test and compare Amazon Bedrock models',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html className="overflow-hidden" lang="en">
        <body className="overflow-hidden">
          <ConvexClientProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider delayDuration={0}>
                <div className="flex h-screen w-screen flex-row overflow-hidden">
                  {children}
                </div>
              </TooltipProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
