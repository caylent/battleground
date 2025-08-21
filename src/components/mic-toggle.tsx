import 'regenerator-runtime/runtime';

import { Mic, MicOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { useIsClient } from 'usehooks-ts';
import { Button } from './ui/button';

export const MicToggle = ({
  sourceId,
  onTranscript,
}: {
  sourceId: string;
  onTranscript: (transcript: string) => void;
}) => {
  const [activeSourceId, setActiveSourceId] = useState<string>();
  const isClient = useIsClient();
  const {
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    listening,
    transcript,
    finalTranscript,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (listening && transcript) {
      const id = setTimeout(() => SpeechRecognition.stopListening(), 1000);
      return () => clearTimeout(id);
    }
  }, [listening, transcript]);

  useEffect(() => {
    if (!finalTranscript) return;
    if (activeSourceId !== sourceId) return;
    onTranscript(finalTranscript);
    SpeechRecognition.stopListening();
    resetTranscript();
    setActiveSourceId(undefined);
  }, [
    activeSourceId,
    finalTranscript,
    onTranscript,
    resetTranscript,
    sourceId,
  ]);

  return (
    isClient &&
    browserSupportsSpeechRecognition &&
    isMicrophoneAvailable && (
      <Button
        onClick={() => {
          if (listening) {
            SpeechRecognition.stopListening();
          } else {
            setActiveSourceId(sourceId);
            SpeechRecognition.startListening({ continuous: true });
          }
        }}
        size="xsicon"
        title={listening ? 'Stop listening' : 'Start listening'}
        variant="ghost"
      >
        {listening ? (
          <Mic className="size-4 animate-pulse text-red-500" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </Button>
    )
  );
};
