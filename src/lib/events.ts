// biome-ignore lint/style/useNodejsImportProtocol: TODO FIX
import { EventEmitter } from 'events';
import { useCallback, useEffect } from 'react';

type EventName = 'prompt-executed' | 'chat-executed' | 'image-executed';

const emitter = new EventEmitter();

export const useSub = <T = any>(
  event: EventName,
  callback: (data: T) => void
) => {
  const unsubscribe = useCallback(() => {
    emitter.off(event, callback);
  }, [callback, event]);

  useEffect(() => {
    emitter.on(event, callback);
    return unsubscribe;
  }, [callback, event, unsubscribe]);

  return unsubscribe;
};

export const usePub = () => {
  return <T>(event: EventName, data?: T) => {
    emitter.emit(event, data);
  };
};
