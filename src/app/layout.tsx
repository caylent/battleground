import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import QueryProvider from './providers';
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
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider delayDuration={0}>
                <div className="flex h-screen w-screen flex-row overflow-hidden">
                  {children}
                </div>
              </TooltipProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
