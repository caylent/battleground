'use client';

import { motion } from 'framer-motion';
import {
  ChevronRight,
  Code,
  Database,
  Lightbulb,
  Rocket,
  Shield,
  Zap,
} from 'lucide-react';

type ChatSuggestionsProps = {
  onSuggestionClick: (suggestion: string) => void;
};

const suggestions = [
  {
    text: 'Explain quantum computing in simple terms',
    icon: Zap,
    category: 'SCIENCE',
  },
  {
    text: 'Write a Python function to sort a list',
    icon: Code,
    category: 'CODE',
  },
  {
    text: 'What are the latest trends in AI?',
    icon: Lightbulb,
    category: 'AI/ML',
  },
  {
    text: 'Help me debug this JavaScript code',
    icon: Shield,
    category: 'DEBUG',
  },
  {
    text: 'Create a marketing strategy for a startup',
    icon: Rocket,
    category: 'STRATEGY',
  },
  {
    text: 'Compare AWS and Azure cloud services',
    icon: Database,
    category: 'CLOUD',
  },
];

export const ChatSuggestions = ({
  onSuggestionClick,
}: ChatSuggestionsProps) => {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      exit={{ opacity: 0, y: 10 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.7, staggerChildren: 0.05 }}
    >
      {suggestions.map((suggestion, index) => {
        const IconComponent = suggestion.icon;
        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            key={suggestion.text}
            transition={{ delay: 0.8 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              className="group relative w-full overflow-hidden rounded-lg border border-border/30 bg-gradient-to-br from-background/80 to-background/40 p-4 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              onClick={() => onSuggestionClick(suggestion.text)}
              type="button"
            >
              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Category badge */}
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium font-orbitron text-primary text-xs tracking-wider">
                  {suggestion.category}
                </span>
                <IconComponent className="size-4 text-primary/80 transition-colors duration-300 group-hover:text-primary/80" />
              </div>

              {/* Main content */}
              <div className="relative flex items-center justify-between">
                <p className="line-clamp-1 font-medium text-foreground/90 text-sm leading-relaxed group-hover:text-foreground">
                  {suggestion.text}
                </p>
                <ChevronRight className="ml-2 size-4 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary/80" />
              </div>

              {/* Subtle grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.02] transition-opacity duration-300 group-hover:opacity-[0.05]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
