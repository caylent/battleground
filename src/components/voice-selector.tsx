import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export type Voice =
  | 'alloy'
  | 'ash'
  | 'ballad'
  | 'coral'
  | 'echo'
  | 'sage'
  | 'shimmer'
  | 'verse';

const voices: Voice[] = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'sage',
  'shimmer',
  'verse',
];

interface VoiceSelectorProps {
  disabled: boolean;
  selectedVoice: Voice;
  onVoiceChange: (voice: Voice) => void;
}

export default function VoiceSelector({
  disabled,
  selectedVoice,
  onVoiceChange,
}: VoiceSelectorProps) {
  return (
    <div className="mt-4">
      <Select
        disabled={disabled}
        onValueChange={(value) => onVoiceChange(value as Voice)}
        value={selectedVoice}
      >
        <SelectTrigger className="min-w-40" disabled={disabled}>
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent>
          {voices.map((voice) => (
            <SelectItem key={voice} value={voice}>
              {voice.charAt(0).toUpperCase() + voice.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
