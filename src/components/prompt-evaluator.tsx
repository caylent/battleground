'use client';

import { useChat } from '@ai-sdk/react';
import {
  BetweenHorizonalEnd,
  Copy,
  Loader2,
  MoreVerticalIcon,
  Play,
  PlusIcon,
  Trash2,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePrompt } from '@/hooks/use-prompt';
import { getPromptVariables } from '@/lib/get-prompt-variables';
import type { TextModel } from '@/lib/model/model.type';
import { textModels } from '@/lib/model/models';
import type { ChatParams } from '@/stores/chat-store';
import type { ResponseMetrics } from '@/types/response-metrics.type';
import { ChatConfig } from './chat-config';
import { MemoizedMarkdown } from './markdown';
import { MetricsDisplay } from './metrics-display';
import { ModelSelect } from './model-select';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type Row = {
  id: string;
  prompt: string;
  variables: Record<string, string>;
  model: TextModel;
  output: string;
  trigger: boolean;
};

export function PromptEvaluator({ promptId }: { promptId?: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const { data: prompt, isLoading } = usePrompt({ id: promptId });

  const promptText =
    prompt?.variants?.[0]?.templateConfiguration?.text?.text ?? '';

  const promptVariables = getPromptVariables(promptText);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Ignore
  useEffect(() => {
    if (!prompt) return;
    setRows([
      {
        id: nanoid(),
        prompt: promptText,
        variables: promptVariables,
        model: textModels[0],
        output: '',
        trigger: false,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const addRow = () => {
    const newRow: Row = {
      id: nanoid(),
      prompt: promptText,
      variables: promptVariables,
      model: textModels[0],
      output: '',
      trigger: false,
    };
    setRows([...rows, newRow]);
  };

  const runAll = () => {
    setRows((oldRows) => oldRows.map((row) => ({ ...row, trigger: true })));
  };

  return (
    <div className="flex h-full w-full flex-col space-y-4 p-4">
      <div className="flex items-center gap-2">
        <h1 className="font-bold">Evaluate:</h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="secondary">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <span>{prompt?.name}</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent align="start" asChild className="p-4" side="bottom">
            <div className="max-h-80 min-w-[400px] max-w-[600px] overflow-y-auto rounded-md border bg-muted p-2 text-sm">
              <pre className="whitespace-pre-wrap">{promptText}</pre>
            </div>
          </TooltipContent>
        </Tooltip>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={addRow} size="sm" variant="ghost">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Row
          </Button>
          <Button onClick={runAll} size="sm" variant="default">
            <Play className="mr-2 h-4 w-4" /> Run All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-full w-full">
        <div className="rounded-md border">
          <Table className="overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] border-r px-0 text-center align-middle">
                  #
                </TableHead>
                {Object.keys(promptVariables).map((name) => (
                  <TableHead className="border-r px-2" key={name}>
                    <span className="rounded-md bg-muted p-1.5 font-bold font-mono text-green-600 text-xs dark:text-green-500">{`{{${name}}}`}</span>
                  </TableHead>
                ))}
                <TableHead className="border-r">Model</TableHead>
                <TableHead className="border-r">Output</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <PromptRow idx={idx} key={row.id} row={row} setRows={setRows} />
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}

const PromptRow = ({
  row,
  idx,
  setRows,
}: {
  row: Row;
  idx: number;
  setRows: Dispatch<SetStateAction<Row[]>>;
}) => {
  const [updateData, setUpdateData] = useState(false);
  const [metrics, setMetrics] = useState<ResponseMetrics>();

  const updateVariable = (rowId: string, varName: string, value: string) => {
    setRows((rows) =>
      rows.map((oldRow) =>
        oldRow.id === rowId
          ? { ...oldRow, variables: { ...oldRow.variables, [varName]: value } }
          : oldRow
      )
    );
  };

  const updateModel = (rowId: string, model: TextModel) => {
    setRows((rows) =>
      rows.map((oldRow) =>
        oldRow.id === rowId ? { ...oldRow, model } : oldRow
      )
    );
  };

  const updateModelConfig = (rowId: string, config: ChatParams) => {
    setRows((rows) =>
      rows.map((oldRow) =>
        oldRow.id === rowId
          ? {
              ...oldRow,
              model: {
                ...oldRow.model,
                config: {
                  systemPrompt:
                    config.systemPrompt ?? oldRow.model.config?.systemPrompt,
                  maxTokens: {
                    ...oldRow.model.config?.maxTokens,
                    value:
                      config.maxTokens ?? oldRow.model.config?.maxTokens.value,
                  },
                  temperature: {
                    ...oldRow.model.config?.temperature,
                    value:
                      config.temperature ??
                      oldRow.model.config?.temperature.value,
                  },
                  topP: {
                    ...oldRow.model.config?.topP,
                    value: config.topP ?? oldRow.model.config?.topP.value,
                  },
                },
              },
            }
          : oldRow
      )
    );
  };

  const synchronizeSystemPrompt = () => {
    setRows((rows) =>
      rows.map((r) => ({
        ...r,
        model: {
          ...r.model,
          config: {
            ...r.model.config,
            systemPrompt: row.model.config?.systemPrompt,
          },
        },
      }))
    );
  };

  const duplicateRow = (rowId: string) => {
    setRows((rows) => {
      const rowToDuplicate = rows.find((oldRow) => oldRow.id === rowId);
      if (rowToDuplicate) {
        const newRow = { ...rowToDuplicate, output: '', id: nanoid() };
        return [...rows, newRow];
      }
      return rows;
    });
  };

  const insertRowBelow = (rowId: string) => {
    setRows((rows) => {
      const index = rows.findIndex((oldRow) => oldRow.id === rowId);
      const newRow: Row = {
        id: nanoid(),
        prompt: row.prompt,
        variables: row.variables,
        model: textModels[0],
        output: '',
        trigger: false,
      };
      return [...rows.slice(0, index + 1), newRow, ...rows.slice(index + 1)];
    });
  };

  const deleteRow = (rowId: string) => {
    setRows((oldRows) => oldRows.filter((oldRow) => oldRow.id !== rowId));
  };

  const runPrompt = (rowId: string) => {
    setRows((rows) =>
      rows.map((oldRow) =>
        oldRow.id === rowId ? { ...oldRow, trigger: true } : oldRow
      )
    );
  };

  const { messages, append, setMessages, isLoading, data } = useChat({
    id: row.id,
    body: {
      modelId: row?.model.id,
      config: row?.model.config,
    },
    streamProtocol: 'data',
    sendExtraMessageFields: true,
    onFinish() {
      setUpdateData(true);
    },
    onError(error) {
      const { message } = JSON.parse(error.message);
      toast.error(`${row?.model.id}: ${message}`);
    },
  });

  // update assistant messages with data if available
  useEffect(() => {
    if (!updateData) return;
    const lastData = data?.at(-1);
    if (!lastData) return;
    setMetrics(lastData as ResponseMetrics);
    setUpdateData(false);
  }, [data, updateData]);

  useEffect(() => {
    if (row.trigger && !isLoading) {
      let filledPrompt = row.prompt;
      for (const [key, value] of Object.entries(row.variables)) {
        filledPrompt = filledPrompt.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
          value
        );
      }
      setMessages([]);
      setMetrics(undefined);
      append({
        role: 'user',
        content: filledPrompt,
      });
      setRows((rows) =>
        rows.map((r) => (r.id === row.id ? { ...r, trigger: false } : r))
      );
    }
  }, [row.trigger, row.prompt, isLoading, setMessages, append, row, setRows]);

  return (
    <TableRow key={row.id}>
      <TableCell className="border-r text-center align-top">
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : idx + 1}
      </TableCell>
      {Object.entries(row.variables).map(([varName, value]) => (
        <TableCell
          className="w-[300px] min-w-[200px] border-r p-2 align-top"
          key={varName}
          onClick={(e) => {
            const textarea = e.currentTarget.querySelector('textarea');
            if (textarea) textarea.focus();
          }}
        >
          <TextareaAutosize
            className="w-full resize-none rounded-md bg-transparent p-2 outline-none"
            maxRows={4}
            minRows={1}
            onChange={(e) => updateVariable(row.id, varName, e.target.value)}
            rows={1}
            value={value}
          />
        </TableCell>
      ))}
      <TableCell className="w-[300px] border-r p-3 align-top">
        <div className="flex items-center space-x-2">
          <ModelSelect
            models={textModels}
            onChange={(modelId) =>
              updateModel(
                row.id,
                textModels.find((m) => m.id === modelId) ?? textModels[0]
              )
            }
            selectedModelId={row.model.id}
          />
          <ChatConfig
            model={row.model}
            onConfigChange={(config) => updateModelConfig(row.id, config)}
            onSynchronizeSystemPrompt={synchronizeSystemPrompt}
          />
        </div>
      </TableCell>
      <TableCell className="min-w-[400px] space-y-4 border-r p-2 text-xs">
        <ScrollArea className="flex max-h-28 w-full flex-col" type="auto">
          <MemoizedMarkdown
            className="text-xs"
            response={messages.at(1)?.content ?? ''}
          />
        </ScrollArea>
        <MetricsDisplay {...metrics} />
      </TableCell>
      <TableCell className="p-2 text-center align-top">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-green-500"
              onClick={() => runPrompt(row.id)}
            >
              <Play className="mr-2 size-4" />
              Run Prompt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => duplicateRow(row.id)}>
              <Copy className="mr-2 size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertRowBelow(row.id)}>
              <BetweenHorizonalEnd className="mr-2 size-4" />
              Insert Below
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => deleteRow(row.id)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
