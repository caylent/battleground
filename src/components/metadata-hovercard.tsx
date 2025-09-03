'use client';

import { InfoIcon } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

type MetadataProps = {
  modelId: string;
  ttft: number;
  cost?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
};

export default function MetadataHoverCard({
  metadata,
}: {
  metadata: MetadataProps;
}) {
  const formatValue = (value: number | string | undefined, suffix = '') => {
    if (value === undefined || value === null) return '—';
    return `${value}${suffix}`;
  };

  const formatCost = (cost: number | undefined) => {
    if (cost === undefined || cost === null) return '—';
    return `$${cost.toFixed(6)}`;
  };

  const formatCompactTokens = (tokens: number | undefined) => {
    if (tokens === undefined || tokens === null) return '—';
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  return (
    <HoverCard closeDelay={300} openDelay={0}>
      <HoverCardTrigger asChild>
        <button
          className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          type="button"
        >
          <InfoIcon className="size-3" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        className="w-80 border-border/20 bg-background/70 backdrop-blur-sm"
        sideOffset={8}
      >
        <div className="space-y-3">
          {/* Header with Model */}
          <div className="border-border/10 border-b pb-2">
            <div className="mb-1 flex items-center gap-2">
              <InfoIcon className="size-3 text-purple-400" />
              <span className="font-medium text-muted-foreground text-xs">
                Response Metadata
              </span>
            </div>
            <div className="truncate font-mono text-foreground/90 text-xs">
              {metadata.modelId}
            </div>
          </div>

          {/* Compact Performance & Cost Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted/20 px-2 py-1.5">
              <div className="text-muted-foreground text-xs">TTFT</div>
              <div className="font-medium font-mono text-purple-400 text-xs">
                {formatValue(metadata.ttft, 'ms')}
              </div>
            </div>
            <div className="rounded-md bg-muted/20 px-2 py-1.5">
              <div className="text-muted-foreground text-xs">Cost</div>
              <div className="font-medium font-mono text-purple-400 text-xs">
                {formatCost(metadata.cost)}
              </div>
            </div>
          </div>

          {/* Compact Token Usage */}
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground text-xs">
              Tokens
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-md bg-muted/10 px-2 py-1 text-center">
                <div className="text-muted-foreground text-xs leading-tight">
                  In
                </div>
                <div className="font-medium font-mono text-xs">
                  {formatCompactTokens(metadata.inputTokens)}
                </div>
              </div>
              <div className="rounded-md bg-muted/10 px-2 py-1 text-center">
                <div className="text-muted-foreground text-xs leading-tight">
                  Out
                </div>
                <div className="font-medium font-mono text-xs">
                  {formatCompactTokens(metadata.outputTokens)}
                </div>
              </div>
              <div className="rounded-md bg-muted/10 px-2 py-1 text-center">
                <div className="text-muted-foreground text-xs leading-tight">
                  Total
                </div>
                <div className="font-medium font-mono text-xs">
                  {formatCompactTokens(metadata.totalTokens)}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Metrics (if available) */}
          {(metadata.reasoningTokens !== undefined ||
            metadata.cachedInputTokens !== undefined) && (
            <div className="border-border/10 border-t pt-2">
              <div className="grid grid-cols-2 gap-1.5">
                {metadata.reasoningTokens !== undefined && (
                  <div className="rounded-md bg-purple-500/10 px-2 py-1 text-center">
                    <div className="text-purple-400 text-xs leading-tight">
                      Reasoning
                    </div>
                    <div className="font-medium font-mono text-purple-300 text-xs">
                      {formatCompactTokens(metadata.reasoningTokens)}
                    </div>
                  </div>
                )}
                {metadata.cachedInputTokens !== undefined && (
                  <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-center">
                    <div className="text-emerald-400 text-xs leading-tight">
                      Cached
                    </div>
                    <div className="font-medium font-mono text-emerald-300 text-xs">
                      {formatCompactTokens(metadata.cachedInputTokens)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
