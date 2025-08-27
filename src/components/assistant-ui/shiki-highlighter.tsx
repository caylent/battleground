'use client';

import type { SyntaxHighlighterProps as AUIProps } from '@assistant-ui/react-markdown';
import { useTheme } from 'next-themes';
import type { FC } from 'react';
import ShikiHighlighter, { type ShikiHighlighterProps } from 'react-shiki';
import { cn } from '@/lib/utils';

/**
 * Props for the SyntaxHighlighter component
 */
export type HighlighterProps = Omit<
  ShikiHighlighterProps,
  'children' | 'theme'
> & {
  theme?: ShikiHighlighterProps['theme'];
} & Pick<AUIProps, 'node' | 'components' | 'language' | 'code'>;

/**
 * SyntaxHighlighter component, using react-shiki
 * Use it by passing to `defaultComponents` in `markdown-text.tsx`
 *
 * @example
 * const defaultComponents = memoizeMarkdownComponents({
 *   SyntaxHighlighter,
 *   h1: //...
 *   //...other elements...
 * });
 */
export const SyntaxHighlighter: FC<HighlighterProps> = ({
  code,
  language,
  theme = 'ayu-dark',
  className,
  addDefaultStyles = false, // assistant-ui requires custom base styles
  showLanguage = false, // assistant-ui/react-markdown handles language labels
  node: _node,
  components: _components,
  ...props
}) => {
  const { resolvedTheme } = useTheme();

  const BASE_STYLES =
    '[&_pre]:overflow-x-auto [&_pre]:rounded-b-lg [&_pre]:bg-black [&_pre]:p-4 [&_pre]:text-white';

  return (
    <ShikiHighlighter
      {...props}
      addDefaultStyles={addDefaultStyles}
      className={cn(BASE_STYLES, className)}
      language={language}
      showLanguage={showLanguage}
      showLineNumbers
      theme={
        resolvedTheme === 'dark'
          ? 'material-theme-darker'
          : 'material-theme-lighter'
      }
    >
      {code.trim()}
    </ShikiHighlighter>
  );
};

SyntaxHighlighter.displayName = 'SyntaxHighlighter';
