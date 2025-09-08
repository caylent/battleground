'use client';

import { useTheme } from 'next-themes';
import type React from 'react';
import { Icons } from '@/components/ui/icons';
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

type SettingRowProps = {
  id: string;
  title: string;
  description: string;
  control: React.ReactNode;
};

function SettingRow({ id, title, description, control }: SettingRowProps) {
  return (
    <div className="grid items-center gap-3 p-4 md:grid-cols-3">
      <div className="space-y-1 md:col-span-2">
        <Label
          className="font-medium text-base"
          htmlFor={id}
          id={`${id}-label`}
        >
          {title}
        </Label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="md:justify-self-end">{control}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [pollyVoice, setPollyVoice] = usePollyVoice();
  const [imageModel, setImageModel] = useImageModel();
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto max-w-3xl space-y-8 p-6">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Fine-tune how the app looks, sounds, and generates images.
        </p>
      </div>

      <Separator />

      <div className="space-y-10">
        {/* Voice Settings Group */}
        <section aria-labelledby="voice-settings">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Icons.aria aria-hidden="true" className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-sm" id="voice-settings">
              Voice
            </h2>
          </div>
          <div className="divide-y rounded-lg">
            <SettingRow
              control={
                <Select onValueChange={setPollyVoice} value={pollyVoice}>
                  <SelectTrigger
                    aria-label="Polly Voice"
                    className="w-full md:w-64"
                    id="polly-voice"
                  >
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
              }
              description="Choose your text‑to‑speech voice."
              id="polly-voice"
              title="Polly Voice"
            />
          </div>
        </section>

        {/* Image Generation Group */}
        <section aria-labelledby="image-settings">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Icons.react aria-hidden="true" className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-sm" id="image-settings">
              Image Generation
            </h2>
          </div>
          <div className="divide-y rounded-lg">
            <SettingRow
              control={
                <Select onValueChange={setImageModel} value={imageModel}>
                  <SelectTrigger
                    aria-label="Image Model"
                    className="w-full md:w-64"
                    id="image-model"
                  >
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
              }
              description="Pick your preferred image model."
              id="image-model"
              title="Image Model"
            />
          </div>
        </section>

        {/* Appearance Group */}
        <section aria-labelledby="appearance-settings">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Icons.radix aria-hidden="true" className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-sm" id="appearance-settings">
              Appearance
            </h2>
          </div>
          <div className="divide-y rounded-lg">
            <SettingRow
              control={
                <Select onValueChange={setTheme} value={theme}>
                  <SelectTrigger
                    aria-label="Theme"
                    className="w-full md:w-64"
                    id="theme"
                  >
                    <SelectValue placeholder="Select theme..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              }
              description="Customize the application theme."
              id="theme"
              title="Theme"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
