import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { shadcn } from '@clerk/themes';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from 'next-themes';
import { ConvexClientProvider } from '@/components/convex-client-provider';
import { cn } from '@/lib/utils';

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
    <ClerkProvider appearance={{ theme: shadcn }}>
      <html
        className={cn(
          'overflow-hidden',
          GeistSans.variable,
          GeistMono.variable
        )}
        lang="en"
        suppressHydrationWarning
      >
        <body>
          <ThemeProvider attribute="class" enableSystem={false}>
            <ConvexClientProvider>
              <TooltipProvider delayDuration={0}>
                <div className="flex h-screen w-screen flex-row overflow-hidden">
                  {children}
                </div>
              </TooltipProvider>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
