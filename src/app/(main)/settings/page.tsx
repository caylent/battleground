'use client';

import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useImageModel, usePollyVoice } from '@/hooks/use-settings';

const PollyVoices = [
  'Ruth',
  'Matthew',
  'Amy',
  'Joanna',
  'Kendra',
  'Kimberly',
  'Salli',
  'Joey',
  'Justin',
  'Brian',
  'Ivy',
];
const ImageModels = ['Nova Canvas'];

export default function SettingsPage() {
  const [pollyVoice, setPollyVoice] = usePollyVoice();
  const [imageModel, setImageModel] = useImageModel();
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-0.5">
        <h1 className="font-bold text-2xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and settings.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>
              Configure your preferred voice for text-to-speech.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="polly-voice">Polly Voice</Label>
              <Select onValueChange={setPollyVoice} value={pollyVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice..." />
                </SelectTrigger>
                <SelectContent>
                  {PollyVoices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Image Generation Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Image Generation</CardTitle>
            <CardDescription>
              Choose your preferred image generation model.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-model">Image Model</Label>
              <Select onValueChange={setImageModel} value={imageModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model..." />
                </SelectTrigger>
                <SelectContent>
                  {ImageModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the appearance of your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select onValueChange={setTheme} value={theme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
