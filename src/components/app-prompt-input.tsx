'use client';

import type { ChatStatus, FileUIPart } from 'ai';
import { PaperclipIcon } from 'lucide-react';
import { useFilePicker } from 'use-file-picker';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { textModels } from '@/lib/model/models';
import { Attachment } from './attachment';

export type AppPromptInputProps = {
  status: ChatStatus;
  onSubmitAction: (event: React.FormEvent) => void;
  input: string;
  setInputAction: (input: string) => void;
  files: FileUIPart[];
  setFilesAction: (files: FileUIPart[]) => void;
  model: string;
  setModelAction: (model: string) => void;
};

export const AppPromptInput = ({
  status,
  onSubmitAction,
  input,
  setInputAction,
  files,
  setFilesAction,
  model,
  setModelAction,
}: AppPromptInputProps) => {
  const { openFilePicker } = useFilePicker({
    accept: 'image/*, text/*',
    readAs: 'DataURL',
    onFilesSuccessfullySelected: ({ filesContent }) => {
      for (const file of filesContent) {
        setFilesAction([
          ...files,
          {
            url: file.content,
            filename: file.name,
            mediaType: file.type,
            type: 'file',
          },
        ]);
      }
    },
  });

  return (
    <PromptInput
      className="mt-2 rounded-md bg-white/5"
      onSubmit={onSubmitAction}
    >
      {files.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2 p-2">
          {files.map((file) => (
            <Attachment
              alt={file.filename ?? ''}
              contentType={file.mediaType ?? ''}
              filename={file.filename ?? ''}
              key={file.filename ?? ''}
              onDeleteAction={() => {
                setFilesAction(files.filter((f) => f.url !== file.url));
              }}
              src={file.url}
            />
          ))}
        </div>
      )}
      <PromptInputTextarea
        onChange={(e) => setInputAction(e.target.value)}
        value={input}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputButton onClick={openFilePicker}>
            <PaperclipIcon className="size-3" />
          </PromptInputButton>
          <PromptInputModelSelect
            onValueChange={(value) => {
              setModelAction(value);
            }}
            value={model}
          >
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              {textModels.map((m) => (
                <PromptInputModelSelectItem key={m.id} value={m.id}>
                  {m.name}
                </PromptInputModelSelectItem>
              ))}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        </PromptInputTools>
        <PromptInputSubmit disabled={!input} status={status} />
      </PromptInputToolbar>
    </PromptInput>
  );
};
