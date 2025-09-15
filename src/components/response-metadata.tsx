'use client';

import { InfoIcon } from 'lucide-react';
import { textModels } from '@/lib/model/models';
import type { MyMetadata } from '@/types/app-message';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

export type ResponseMetadataProps = {
  metadata: MyMetadata;
};

export default function ResponseMetadata({ metadata }: ResponseMetadataProps) {
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

  const formatModelName = (modelId: string | undefined) => {
    if (!modelId) return 'Unknown Model';
    const model = textModels.find((m) => m.id === modelId);
    return model?.name || modelId;
  };

  const formatProvider = (modelId: string | undefined) => {
    if (!modelId) return 'Unknown';
    const model = textModels.find((m) => m.id === modelId);
    return model?.provider || 'Unknown';
  };

  const calculateTokensPerSecond = () => {
    if (!(metadata.outputTokens && metadata.totalResponseTime)) return '—';
    const tokensPerMs = metadata.outputTokens / metadata.totalResponseTime;
    const tokensPerSecond = tokensPerMs * 1000;
    return tokensPerSecond.toFixed(1);
  };

  const formatTime = (time: number | undefined) => {
    if (time === undefined || time === null) return '—';
    if (time >= 1000) return `${(time / 1000).toFixed(2)}s`;
    return `${time}ms`;
  };

  return (
    <HoverCard closeDelay={200} openDelay={100}>
      <HoverCardTrigger asChild>
        <button
          aria-label="Response metrics"
          className="relative size-6 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          type="button"
        >
          <InfoIcon className="size-3" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-fit border-border/20 bg-background/95 shadow-lg backdrop-blur-sm"
        sideOffset={8}
      >
        <div className="space-y-2">
          {/* Header with Model */}
          <div className="border-border/10 border-b pb-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium text-foreground text-xs">
                {formatModelName(metadata.modelId)}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {formatProvider(metadata.modelId)}
            </div>
          </div>

          {/* Performance & Cost Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            <div className="rounded-md bg-muted/30 px-2 py-1 text-center">
              <div className="text-muted-foreground text-xs">TTFT</div>
              <div className="font-medium font-mono text-foreground text-xs">
                {formatTime(metadata.ttft)}
              </div>
            </div>
            {metadata.totalResponseTime && (
              <div className="rounded-md bg-muted/30 px-2 py-1 text-center">
                <div className="text-muted-foreground text-xs">Total</div>
                <div className="font-medium font-mono text-foreground text-xs">
                  {formatTime(metadata.totalResponseTime)}
                </div>
              </div>
            )}
            <div className="rounded-md bg-muted/30 px-2 py-1 text-center">
              <div className="text-muted-foreground text-xs">Speed</div>
              <div className="font-medium font-mono text-foreground text-xs">
                {calculateTokensPerSecond()} tok/s
              </div>
            </div>
            <div className="rounded-md bg-green-500/10 px-2 py-1 text-center">
              <div className="text-muted-foreground text-xs">Cost</div>
              <div className="font-medium font-mono text-green-600 text-xs dark:text-green-400">
                {formatCost(metadata.cost)}
              </div>
            </div>
          </div>

          {/* Token Usage */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="rounded-md bg-blue-500/10 px-2 py-1 text-center">
              <div className="text-blue-600 text-xs dark:text-blue-400">
                Tokens In
              </div>
              <div className="font-medium font-mono text-foreground text-xs">
                {formatCompactTokens(metadata.inputTokens)}
              </div>
            </div>
            <div className="rounded-md bg-orange-500/10 px-2 py-1 text-center">
              <div className="text-orange-600 text-xs dark:text-orange-400">
                Tokens Out
              </div>
              <div className="font-medium font-mono text-foreground text-xs">
                {formatCompactTokens(metadata.outputTokens)}
              </div>
            </div>
            <div className="rounded-md bg-purple-500/10 px-2 py-1 text-center">
              <div className="text-purple-600 text-xs dark:text-purple-400">
                Total
              </div>
              <div className="font-medium font-mono text-foreground text-xs">
                {formatCompactTokens(metadata.totalTokens)}
              </div>
            </div>
          </div>

          {/* Additional metrics if available */}
          {(metadata.reasoningTokens !== undefined ||
            metadata.cachedInputTokens !== undefined) && (
            <div className="grid grid-cols-2 gap-1.5 text-center">
              {metadata.reasoningTokens !== undefined && (
                <div className="rounded-md bg-indigo-500/10 px-2 py-1">
                  <div className="text-indigo-600 text-xs dark:text-indigo-400">
                    Reasoning
                  </div>
                  <div className="font-medium font-mono text-foreground text-xs">
                    {formatCompactTokens(metadata.reasoningTokens)}
                  </div>
                </div>
              )}
              {metadata.cachedInputTokens !== undefined && (
                <div className="rounded-md bg-cyan-500/10 px-2 py-1">
                  <div className="text-cyan-600 text-xs dark:text-cyan-400">
                    Cached
                  </div>
                  <div className="font-medium font-mono text-foreground text-xs">
                    {formatCompactTokens(metadata.cachedInputTokens)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error (if present) */}
          {metadata.error && (
            <div className="border-border/10 border-t pt-2">
              <div className="rounded-md bg-destructive/10 px-2 py-1">
                <div className="mb-1 font-medium text-destructive text-xs">
                  Error
                </div>
                <div className="text-destructive/80 text-xs">
                  {metadata.error}
                </div>
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
