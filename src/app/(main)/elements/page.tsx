'use client';

import { ArrowRight, MessageSquarePlus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ElementsMainPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 font-bold text-3xl">AI SDK Elements</h1>
        <p className="text-lg text-muted-foreground">
          Experience the next generation of AI chat interfaces
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="group transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5" />
              Chat Interface
            </CardTitle>
            <CardDescription>
              Interactive chat powered by AI SDK Elements with advanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="group w-full"
              onClick={() => router.push('/elements/chat')}
            >
              Open Chat
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What makes AI Elements special</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Pre-built conversation components</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Advanced prompt input with model selection</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Streaming responses with status indicators</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Tool calling and image support</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Customizable with shadcn/ui</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About This Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This implementation demonstrates the power of AI SDK Elements - a
            customizable React component library built on shadcn/ui. It provides
            a complete chat interface with advanced features like model
            selection, streaming responses, and tool integration.
          </p>
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-medium">Key Components Used:</h4>
            <div className="grid gap-1 text-muted-foreground text-sm">
              <span>• Conversation & ConversationContent</span>
              <span>• Message & MessageContent</span>
              <span>• PromptInput with Textarea and Toolbar</span>
              <span>• Response with Streamdown rendering</span>
              <span>• Tool and Image components</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
