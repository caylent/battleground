'use client';

import { useChat } from '@ai-sdk/react';
import { type Editor, Extension } from '@tiptap/core';
import HardBreak from '@tiptap/extension-hard-break';
import Placeholder from '@tiptap/extension-placeholder';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Loader2, PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePrompt } from '@/hooks/use-prompt';
import { textModels } from '@/lib/model/models';
import { ChatConfig } from './chat-config';
import { MemoizedMarkdown } from './markdown';
import { ModelSelect } from './model-select';
import { PromptDropdownMenu } from './prompt-dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const VariableHighlight = Extension.create({
  name: 'variableHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('variableHighlight'),
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              const text = node.text;
              if (text) {
                const regex = /\{\{([^}]+)\}\}/g;
                let match = regex.exec(text);
                while (match !== null) {
                  const start = pos + match.index;
                  const end = start + match[0].length;
                  decorations.push(
                    Decoration.inline(start, end, {
                      class:
                        'bg-yellow-200 dark:text-black font-medium p-1 rounded-lg',
                    })
                  );
                  match = regex.exec(text);
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

const CustomExtension = StarterKit.configure({
  history: { depth: 10 },
});

export function PromptEditorComponent({ promptId }: { promptId?: string }) {
  const [variables, setVariables] = useLocalStorage<Record<string, string>>(
    `prompt-variables-${promptId}`,
    {},
    { initializeWithValue: false }
  );
  const [selectedModel, setSelectedModel] = useLocalStorage(
    'prompt-editor-model',
    textModels[0],
    {
      initializeWithValue: false,
    }
  );
  const [isPromptEmpty, setIsPromptEmpty] = useState(true);
  const [name, setName] = useState('Untitled Prompt');
  const [description, setDescription] = useState('');

  const { data: prompt, isLoading } = usePrompt({ id: promptId });

  const getVariables = ({ editor: editorParam }: { editor: Editor }) => {
    const content = editorParam.getText();
    setIsPromptEmpty(content.trim().length === 0);
    const extractedVariables = content.match(/\{\{([^}]+)\}\}/g) || [];
    const newVariables = extractedVariables.reduce(
      (acc, variable) => {
        const varName = variable.slice(2, -2);
        // biome-ignore lint/performance/noAccumulatingSpread: TODO FIX
        return { ...acc, [varName]: variables[varName] || '' };
      },
      {} as Record<string, string>
    );
    setVariables(newVariables);
  };

  const editor = useEditor({
    extensions: [
      CustomExtension,
      VariableHighlight,
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            // biome-ignore lint/nursery/noNestedComponentDefinitions: TODO FIX
            Enter: ({ editor: editorParam }) =>
              editorParam.commands.setHardBreak(),
          };
        },
      }),
      Placeholder.configure({
        placeholder:
          'Enter your prompt here. Use {{variable_name}} for variables.',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    immediatelyRender: false,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none w-full h-full text-sm',
      },
    },
    onUpdate: getVariables,
  });

  useEffect(() => {
    if (prompt) {
      setName(prompt?.name ?? 'Untitled Prompt');
      setDescription(prompt?.description ?? '');

      const content =
        prompt?.variants?.[0].templateConfiguration?.text?.text ?? '';

      // the newline replacement is necessary to preserve the line breaks in the editor
      editor
        ?.chain()
        .setContent(content.replace(/\n/g, '<br>'), true, {
          preserveWhitespace: 'full',
        })
        .run();
    }
  }, [editor, prompt]);

  const focusEditor = () => {
    editor?.chain().focus().run();
  };

  const chat = useChat({
    body: {
      modelId: selectedModel.id,
      config: selectedModel.config,
    },
    streamProtocol: 'data',
    sendExtraMessageFields: true,
    onError(error) {
      const { message } = JSON.parse(error.message);
      toast.error(`${selectedModel.id}: ${message}`);
    },
  });

  const isTestButtonDisabled =
    isPromptEmpty || Object.values(variables).some((value) => value === '');

  const handleTestPrompt = () => {
    const promptContent = editor?.getText() || '';
    let filledPrompt = promptContent;
    for (const [key, value] of Object.entries(variables)) {
      filledPrompt = filledPrompt.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        value
      );
    }
    chat.setMessages([]);
    chat.append({ role: 'user', content: filledPrompt, createdAt: new Date() });
  };

  return (
    <div className="flex h-full w-full divide-x bg-gray-50 dark:bg-background/20">
      <div className="flex h-full w-96 flex-col">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex h-11 flex-col justify-center">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="ml-2 size-5 animate-spin" />
              ) : (
                <h1 className="font-medium text-lg">{name}</h1>
              )}
              {prompt?.version && (
                <Badge
                  className="h-5 bg-primary text-primary-foreground text-xs"
                  variant="outline"
                >
                  {prompt?.version ?? '-'}
                </Badge>
              )}
            </div>
            {prompt?.description && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <PromptDropdownMenu
              promptId={promptId}
              promptText={editor?.getText({ blockSeparator: '\n' })}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={isTestButtonDisabled || chat.isLoading}
                  onClick={handleTestPrompt}
                  size="icon"
                  variant="ghost"
                >
                  {chat.isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <PlayIcon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs" side="bottom">
                Test Prompt
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-3">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <div className="h-[400px] cursor-text overflow-y-auto rounded-md border bg-background p-2 focus-within:border-primary">
              <EditorContent editor={editor} onClick={focusEditor} />
            </div>
          </div>

          <div className="flex-1">
            {Object.keys(variables).length > 0 && (
              <div className="space-y-2">
                <Label>Variables</Label>
                <div className="space-y-4">
                  {Object.entries(variables).map(([key, value]) => (
                    <div className="flex flex-col space-y-2" key={key}>
                      <Label className="font-medium text-sm" htmlFor={key}>
                        {key}
                      </Label>
                      <Input
                        className="w-full focus:border-primary focus-visible:ring-transparent"
                        id={key}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder={`Enter value for ${key}`}
                        value={value}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <ModelSelect
            models={textModels}
            onChange={(modelId) =>
              setSelectedModel(
                textModels.find((m) => m.id === modelId) ?? textModels[0]
              )
            }
            selectedModelId={selectedModel.id}
          />
          <ChatConfig
            model={selectedModel}
            onConfigChange={(config) =>
              setSelectedModel({
                ...selectedModel,
                config: {
                  systemPrompt:
                    config.systemPrompt ?? selectedModel.config?.systemPrompt,
                  maxTokens: {
                    ...selectedModel.config?.maxTokens,
                    value:
                      config.maxTokens ?? selectedModel.config?.maxTokens.value,
                  },
                  temperature: {
                    ...selectedModel.config?.temperature,
                    value:
                      config.temperature ??
                      selectedModel.config?.temperature.value,
                  },
                  topP: {
                    ...selectedModel.config?.topP,
                    value: config.topP ?? selectedModel.config?.topP.value,
                  },
                },
              })
            }
          />
        </div>
        <div className="h-full w-full flex-1 overflow-y-auto rounded-md border bg-background p-2">
          {chat.messages?.length >= 2 ? (
            <>
              <MemoizedMarkdown
                response={chat.messages?.at(-1)?.content ?? ''}
              />
              {chat.isLoading && (
                <Loader2 className="ml-2 size-3 animate-spin" />
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Output will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
