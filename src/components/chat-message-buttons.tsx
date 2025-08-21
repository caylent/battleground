'use client';

import { Copy, Loader, Pause, PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import { usePollyVoice } from './settings-button';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const ChatMessageButtons = ({ message }: { message: string }) => {
  const [audioLoading, setAudioLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [pollyVoice] = usePollyVoice();
  const [refetchAudio, setRefetchAudio] = useState(true);
  const [_, copyToClipboard] = useCopyToClipboard();

  useEffect(() => {
    if (message.length === 0) return;
    setRefetchAudio(true);
  }, [message]);

  useEffect(() => {
    setAudio(new Audio());
  }, []);

  const playAudio = () => {
    if (message.length === 0) return;
    if (!audio) return;

    if (!refetchAudio) {
      audio.currentTime = 0;
      audio.play();
      return;
    }

    const content = message;

    setAudioLoading(true);

    // request the audio stream from the server
    fetch('/api/audio', {
      method: 'POST',
      body: JSON.stringify({
        voiceId: pollyVoice,
        message: content,
      }),
    })
      .then(async (res) => {
        const data = await res.arrayBuffer();
        const blob = new Blob([data], { type: 'audio/mpeg' });
        audio.src = URL.createObjectURL(blob);
        audio.load();
        audio.play();
      })
      .catch((err: Error) => {
        const { message: errorMessage } = JSON.parse(err.message) as {
          message: string;
        };
        toast.error(errorMessage);
      })
      .finally(() => {
        setAudioLoading(false);
        setRefetchAudio(false);
      });
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-6 w-6"
            disabled={message.length === 0}
            onClick={() => {
              copyToClipboard(message);
              toast.success('Copied to clipboard');
            }}
            size="xsicon"
            variant="ghost"
          >
            <Copy className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs" side="bottom">
          Copy message
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-6 w-6"
            disabled={message.length === 0 || !audio || audioLoading}
            onClick={playAudio}
            size="xsicon"
            variant="ghost"
          >
            {audioLoading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <PlayIcon className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs" side="bottom">
          Play audio
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-6 w-6"
            disabled={message.length === 0 || !audio}
            onClick={() => {
              if (audio) {
                audio.pause();
                audio.currentTime = 0;
              }
            }}
            size="xsicon"
            variant="ghost"
          >
            <Pause className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs" side="bottom">
          Pause audio
        </TooltipContent>
      </Tooltip>
    </>
  );
};
