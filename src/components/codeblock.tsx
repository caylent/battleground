'use client';

import { Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  materialDark as darkTheme,
  materialOceanic as lightTheme,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const TRAILING_NEWLINE_REGEX = /\n$/;

type CodeblockProps = {
  language?: string;
  children: ReactNode;
};

export const Codeblock = ({ language = 'text', children }: CodeblockProps) => {
  const { resolvedTheme: theme } = useTheme();
  const copyToClipboard = () => {
    navigator.clipboard.writeText(String(children));
    toast('Code copied to clipboard');
  };

  return (
    <div className="relative my-2 w-fit p-1 text-xs">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="absolute right-1 text-white"
            onClick={copyToClipboard}
            variant="link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs" sideOffset={-5}>
          Copy code to clipboard
        </TooltipContent>
      </Tooltip>

      <SyntaxHighlighter
        customStyle={{ margin: 0 }}
        language={language}
        style={theme === 'dark' ? darkTheme : lightTheme}
        useInlineStyles
        wrapLongLines
      >
        {String(children).replace(TRAILING_NEWLINE_REGEX, '')}
      </SyntaxHighlighter>
    </div>
  );
};
