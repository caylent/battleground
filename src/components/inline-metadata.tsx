'use client';

import { CircleDollarSign, CircleGaugeIcon, ZapIcon } from 'lucide-react';
import { textModels } from '@/lib/model/models';
import type { MyMetadata } from '@/types/app-message';

export default function InlineMetadata({ metadata }: { metadata: MyMetadata }) {
  const formatValue = (value: number | string | undefined, suffix = '') => {
    if (value === undefined || value === null) return '—';
    return `${value} ${suffix}`;
  };

  const calculateTokensPerSecond = () => {
    if (!(metadata.outputTokens && metadata.totalResponseTime)) return '—';
    const tokensPerMs = metadata.outputTokens / metadata.totalResponseTime;
    const tokensPerSecond = tokensPerMs * 1000;
    return tokensPerSecond.toFixed(1);
  };

  const formatModelName = (modelId: string) => {
    const model = textModels.find((m) => m.id === modelId);
    return model?.name || modelId;
  };

  const formatCost = (cost: number | undefined) => {
    if (cost === undefined || cost === null) return '—';
    return `$${cost.toFixed(6)}`;
  };

  return (
    <div className="hidden w-fit items-center text-muted-foreground text-xs tracking-wide sm:flex">
      <span className="whitespace-nowrap">
        {formatModelName(metadata.modelId ?? '')}
      </span>
      <ZapIcon className="mr-1.5 ml-3 size-3 text-yellow-500" />
      <span className="whitespace-nowrap">
        TTFT: {formatValue(metadata.ttft, 'ms')}
      </span>
      <CircleGaugeIcon className="mr-1.5 ml-3 size-3 text-blue-500" />
      <span className="whitespace-nowrap">
        {calculateTokensPerSecond()} tok/s
      </span>
      <CircleDollarSign className="mr-1.5 ml-3 size-3 text-green-500" />
      <span className="whitespace-nowrap">{formatCost(metadata.cost)}</span>
    </div>
  );
}
