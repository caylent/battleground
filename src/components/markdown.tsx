import Markdown from 'markdown-to-jsx';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Codeblock } from './codeblock';
import { Mermaid } from './mermaid';

const CODE_LANG_REGEX = /lang-(\w+)/;

export const MemoizedMarkdown = memo(function MarkdownComponent({
  response,
  className,
  isLoading = false,
}: {
  messageId?: string;
  response: string;
  className?: string;
  isLoading?: boolean;
}) {
  return (
    <Markdown
      className={cn(
        'prose dark:prose-invert prose-pre:m-0 flex max-w-none flex-col overflow-y-auto overflow-x-hidden prose-pre:rounded-md prose-pre:bg-transparent p-1 prose-pre:p-0 font-light prose-pre:font-light prose-pre:text-sm text-sm',
        className
      )}
      options={{
        overrides: {
          p(props) {
            return <div {...props} />;
          },
          code(props) {
            const { children, className: codeClassName } = props;
            const match = CODE_LANG_REGEX.exec(codeClassName || '');

            if (match?.[1] === 'mermaid') {
              return isLoading ? (
                <span className="text-foreground">Loading diagram...</span>
              ) : (
                <Mermaid id={nanoid()} source={children.toString()} />
              );
            }

            const lines = children.toString().split('\n') as string[];

            if (lines?.[0].trim() === 'mermaid') {
              return isLoading ? (
                <span className="text-foreground">Loading diagram...</span>
              ) : (
                <Mermaid id={nanoid()} source={lines.slice(1).join('\n')} />
              );
            }

            return match ? (
              <Codeblock language={match?.[1] ?? 'text'}>{children}</Codeblock>
            ) : (
              <div className="my-1 inline-block rounded-md border bg-background p-1">
                <code className="code text-wrap font-mono text-foreground text-xs">
                  {children}
                </code>
              </div>
            );
          },
          img(props) {
            const { src, alt } = props;
            return (
              <Image
                alt={alt ?? ''}
                className="m-2 max-h-96 object-contain"
                height={100}
                src={src ?? ''}
                width={100}
              />
            );
          },
        },
      }}
    >
      {response}
    </Markdown>
  );
});
