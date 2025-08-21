import type { ResponseMetrics } from '@/types/response-metrics.type';
import { Badge } from './ui/badge';

export const MetricsDisplay = (data: Partial<ResponseMetrics>) => {
  return (
    <div className="flex flex-wrap gap-1">
      {!!data.firstTokenTime && (
        <Badge
          className="text-nowrap font-light"
          title="Time to first token"
          variant="outline"
        >
          TTFT:&nbsp;<span>{data.firstTokenTime} ms</span>
        </Badge>
      )}
      {!!data.responseTime && (
        <Badge
          className="text-nowrap font-light"
          title="Total response time"
          variant="outline"
        >
          Time:&nbsp;<span>{data.responseTime} ms</span>
        </Badge>
      )}
      {!!data.inputTokens && (
        <Badge
          className="text-nowrap font-light"
          title="Total input tokens"
          variant="outline"
        >
          Input:&nbsp;<span>{data.inputTokens} tkns</span>
        </Badge>
      )}
      {!!data.outputTokens && (
        <Badge
          className="text-nowrap font-light"
          title="Total output tokens"
          variant="outline"
        >
          Output:&nbsp;<span>{data.outputTokens} tkns</span>
        </Badge>
      )}
      {!!data.cost && (
        <Badge
          className="text-nowrap font-light"
          title="Estimated cost"
          variant="outline"
        >
          Cost:&nbsp;
          <span>${data.cost?.toPrecision(1)}</span>
        </Badge>
      )}
    </div>
  );
};
