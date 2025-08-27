import { useLocalStorage } from 'usehooks-ts';

export const usePollyVoice = () =>
  useLocalStorage('polly-voice-id', 'Ruth', { initializeWithValue: false });

export const useImageModel = () =>
  useLocalStorage('image-model', 'Nova Canvas', { initializeWithValue: false });