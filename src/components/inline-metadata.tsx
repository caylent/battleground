'use client';

import { CircleGaugeIcon, ZapIcon } from 'lucide-react';
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

  return (
    <div className="flex items-center text-muted-foreground text-xs tracking-wide">
      <span className="">{formatModelName(metadata.modelId)}</span>
      <ZapIcon className="mr-1.5 ml-3 size-3 text-yellow-500" />
      <span>TTFT: {formatValue(metadata.ttft, 'ms')}</span>
      <CircleGaugeIcon className="mr-1.5 ml-3 size-3 text-blue-500" />
      <span>{calculateTokensPerSecond()} tok/s</span>
    </div>
  );
}
