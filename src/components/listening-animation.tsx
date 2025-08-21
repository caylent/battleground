'use client';

import { motion } from 'framer-motion';
import type { RtcStatus } from '@/hooks/use-rtc-session';

interface ListeningAnimationProps {
  isListening: boolean;
  status: RtcStatus;
  onClick: () => void;
}

export default function ListeningAnimation({
  isListening,
  status,
  onClick,
}: ListeningAnimationProps) {
  const buttonText = (() => {
    if (status === 'connected') {
      return 'Stop';
    }
    if (status === 'disconnected') {
      return 'Start';
    }
    return 'Connecting...';
  })();

  return (
    <motion.button
      className="relative h-48 w-48 cursor-pointer border-none bg-transparent focus:outline-none"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{
          scale: isListening ? [1, 1.2, 1] : 1,
        }}
        className="absolute inset-0 rounded-full bg-green-500 opacity-75"
        transition={{
          duration: 1.5,
          repeat: isListening ? Number.POSITIVE_INFINITY : 0,
          repeatType: 'loop',
        }}
      />
      <motion.div
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
        }}
        className="absolute inset-0 flex items-center justify-center rounded-full bg-green-300"
        transition={{
          duration: 1.5,
          repeat: isListening ? Number.POSITIVE_INFINITY : 0,
          repeatType: 'loop',
          delay: 0.2,
        }}
      >
        <span className="font-semibold text-gray-800">{buttonText}</span>
      </motion.div>
    </motion.button>
  );
}
