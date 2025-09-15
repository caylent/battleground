import type { MyUIMessage } from '@/types/app-message';
import type { Doc } from '../../convex/_generated/dataModel';

export type ExportRow = {
  chatId: string;
  messageId: string;
  modelId?: string;
  modelParams?: string;
  region?: string;
  firstTokenTime?: number;
  responseTime?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  reasoningTime?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  error?: string;
  modelProvider?: string;
  modelName?: string;
  timestamp?: number;
};

export function exportBattleResults(chats: Doc<'chats'>[]) {
  const csvData: ExportRow[] = [];

  for (const chat of chats) {
    if (!chat.messages || chat.messages.length === 0) continue;

    for (const message of chat.messages as MyUIMessage[]) {
      if (message.role === 'assistant' && message.metadata) {
        const messageMetadata = message.metadata;

        const row: ExportRow = {
          chatId: chat._id,
          messageId: message.id,
          modelId: messageMetadata?.modelId || chat.model?.id,
          modelParams: JSON.stringify({
            systemPrompt: chat.model?.settings?.systemPrompt || '',
            maxTokens: chat.model?.settings?.maxTokens || 512,
            temperature: chat.model?.settings?.temperature || 1,
            topP: 0.999, // Default value from your example
          }),
          region: chat.model?.region || 'us-east-1',
          firstTokenTime: messageMetadata?.ttft,
          responseTime: messageMetadata?.totalResponseTime,
          inputTokens: messageMetadata?.inputTokens,
          outputTokens: messageMetadata?.outputTokens,
          cost: messageMetadata?.cost,
          reasoningTime: messageMetadata?.reasoningTime,
          reasoningTokens: messageMetadata?.reasoningTokens,
          cachedInputTokens: messageMetadata?.cachedInputTokens,
          error: messageMetadata?.error,
          modelProvider: chat.model?.provider,
          modelName: chat.model?.name,
          timestamp: chat.updatedAt,
        };

        csvData.push(row);
      }
    }
  }

  // Create CSV headers based on your example
  const headers = [
    { label: 'Chat ID', key: 'chatId' },
    { label: 'Message ID', key: 'messageId' },
    { label: 'Model ID', key: 'modelId' },
    { label: 'Model Params', key: 'modelParams' },
    { label: 'Region', key: 'region' },
    { label: 'First Token Time', key: 'firstTokenTime' },
    { label: 'Response Time', key: 'responseTime' },
    { label: 'Input Tokens', key: 'inputTokens' },
    { label: 'Output Tokens', key: 'outputTokens' },
    { label: 'Cost', key: 'cost' },
    { label: 'Reasoning Time', key: 'reasoningTime' },
    { label: 'Reasoning Tokens', key: 'reasoningTokens' },
    { label: 'Cached Input Tokens', key: 'cachedInputTokens' },
    { label: 'Error', key: 'error' },
    { label: 'Model Provider', key: 'modelProvider' },
    { label: 'Model Name', key: 'modelName' },
    { label: 'Timestamp', key: 'timestamp' },
  ];

  // Create a temporary link element to trigger download
  const csvContent = [
    headers.map((h) => h.label).join(','),
    ...csvData.map((row) =>
      headers
        .map((h) => {
          const value = row[h.key as keyof ExportRow];
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"') || value.includes('\n'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value?.toString() || '';
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `battle-results-${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
