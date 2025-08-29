'use client';

import { useMutation } from 'convex/react';
import { MessageSquarePlus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '../../../../../convex/_generated/api';

export default function ElementsChatMainPage() {
  const router = useRouter();
  const createChat = useMutation(api.chats.create);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = async () => {
    setIsCreating(true);
    try {
      const newChatId = await createChat({
        name: 'New AI Elements Chat',
        initialMessages: [],
      });

      router.push(`/elements/chat/${newChatId}`);
      toast.success('New chat created!');
    } catch (error) {
      toast.error('Failed to create chat');
      console.error('Error creating chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 font-bold text-3xl">AI Elements Chat</h1>
        <p className="text-lg text-muted-foreground">
          Experience AI conversations with the new AI SDK Elements interface
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            Start a New Conversation
          </CardTitle>
          <CardDescription>
            Create a new chat to begin interacting with AI using the Elements
            interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            disabled={isCreating}
            onClick={handleCreateChat}
            size="lg"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                Create New Chat
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About AI Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            AI Elements is a modern, customizable React component library built
            on shadcn/ui to accelerate the development of AI-native
            applications.
          </p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>Pre-built conversation and message components</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>Advanced prompt input with model selection</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>Real-time streaming responses</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>Integrated with AI SDK for seamless chat experiences</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
