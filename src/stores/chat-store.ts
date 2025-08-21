import type { Message } from 'ai';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { TextModel } from '@/lib/model/model.type';
import { textModels } from '@/lib/model/models';
import type { ImageData } from '@/types/image-data.type';

export type Chat = {
  id: string;
  model: TextModel;
  input: string;
  attachments: ImageData[];
  synced: boolean;
  messages: Message[];
};

export type ChatParams = {
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  reasoning?: {
    enabled: boolean;
    budgetTokens: number;
  };
};

type ChatStoreState = {
  // State
  chats: Chat[];
  // Actions
  addChat: () => void;
  removeChat: (id: string) => void;
  resetChats: () => void;
  resetChat: (id: string) => void;
  setChatModel: (id: string, model: TextModel) => void;
  updateModelParams: (id: string, params: ChatParams) => void;
  setChatInput: (id: string, input: string) => void;
  addAttachmentToChat: (id: string, attachment: ImageData) => void;
  removeAttachmentFromChat: (id: string, attachment: ImageData) => void;
  resetChatInput: (id: string) => void;
  setChatSynced: (id: string, synced: boolean) => void;
  setChatMessages: (id: string, messages: Message[]) => void;
};

export const useChatStore = create<ChatStoreState>()(
  persist(
    immer((set) => ({
      chats: [
        {
          id: nanoid(),
          model: textModels[0],
          messages: [],
          input: '',
          attachments: [],
          synced: true,
        },
      ],

      addChat: () =>
        set((state) => {
          state.chats.push({
            id: nanoid(),
            model: textModels[0],
            input: '',
            attachments: [],
            synced: true,
            messages: [],
          });
        }),

      removeChat: (id: string) =>
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          state.chats.splice(chatIndex, 1);
          if (state.chats.length === 0) {
            state.chats.push({
              id: nanoid(),
              model: textModels[0],
              input: '',
              attachments: [],
              synced: true,
              messages: [],
            });
          }
        }),

      setChatModel: (id: string, model: TextModel) =>
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          state.chats[chatIndex].model = model;
          state.chats[chatIndex].id = nanoid();
          state.chats[chatIndex].input = '';
          state.chats[chatIndex].attachments = [];
          state.chats[chatIndex].messages = [];
        }),

      updateModelParams: (id: string, params: ChatParams) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          state.chats[chatIndex].model.config = {
            systemPrompt:
              params.systemPrompt ??
              state.chats[chatIndex].model.config?.systemPrompt,
            maxTokens: {
              ...state.chats[chatIndex].model.config?.maxTokens,
              value:
                params.maxTokens ??
                state.chats[chatIndex].model.config?.maxTokens.value,
            },
            temperature: {
              ...state.chats[chatIndex].model.config?.temperature,
              value:
                params.temperature ??
                state.chats[chatIndex].model.config?.temperature.value,
            },
            topP: {
              ...state.chats[chatIndex].model.config?.topP,
              value:
                params.topP ?? state.chats[chatIndex].model.config?.topP.value,
            },
            reasoning: {
              ...state.chats[chatIndex].model.config?.reasoning,
              enabled:
                params.reasoning?.enabled ??
                state.chats[chatIndex].model.config?.reasoning?.enabled ??
                false,
              budgetTokens: {
                min: 0,
                max: 4096,
                default: 1024,
                ...state.chats[chatIndex].model.config?.reasoning?.budgetTokens,
                value:
                  params.reasoning?.budgetTokens ??
                  state.chats[chatIndex].model.config?.reasoning?.budgetTokens
                    ?.value ??
                  1024,
              },
            },
          };
        });
      },

      resetChat: (id: string) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          // changing the chat id will reset the chat within the useChat hook
          state.chats[chatIndex].id = nanoid();
          state.chats[chatIndex].input = '';
          state.chats[chatIndex].attachments = [];
          state.chats[chatIndex].messages = [];
        });
      },

      resetChats: () => {
        set((state) => {
          for (const chat of state.chats) {
            // changing the chat id will reset the chat within the useChat hook
            chat.id = nanoid();
            chat.input = '';
            chat.attachments = [];
            chat.messages = [];
          }
        });
      },

      setChatInput: (id: string, input: string) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          if (state.chats[chatIndex].synced) {
            for (const chat of state.chats) {
              if (chat.synced && chat.model.inputModalities.includes('TEXT')) {
                chat.input = input;
              }
            }
          } else {
            state.chats[chatIndex].input = input;
          }
        });
      },

      addAttachmentToChat: (id: string, attachment: ImageData) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          if (state.chats[chatIndex].synced) {
            for (const chat of state.chats) {
              if (chat.synced && chat.model.inputModalities.includes('IMAGE')) {
                chat.attachments.push(attachment);
              }
            }
          } else {
            state.chats[chatIndex].attachments.push(attachment);
          }
        });
      },

      removeAttachmentFromChat: (id: string, attachment: ImageData) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          if (state.chats[chatIndex].synced) {
            for (const chat of state.chats) {
              chat.attachments = chat.attachments.filter(
                (a) => a.name !== attachment.name
              );
            }
          } else {
            state.chats[chatIndex].attachments = state.chats[
              chatIndex
            ].attachments.filter((a) => a.name !== attachment.name);
          }
        });
      },

      resetChatInput: (id: string) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          state.chats[chatIndex].input = '';
          state.chats[chatIndex].attachments = [];
        });
      },

      setChatSynced: (id: string, synced: boolean) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          state.chats[chatIndex].synced = synced;
        });
      },

      setChatMessages: (id: string, messages: Message[]) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          // @ts-expect-error
          state.chats[chatIndex].messages = messages;
        });
      },
    })),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // don't store messages or attachments in local storage
      partialize: (state) => {
        return {
          chats: state.chats.map((chat) => ({
            ...chat,
            attachments: [],
            messages: [
              ...chat.messages.map((m) => ({
                ...m,
                data: m.role === 'assistant' ? m.data : {},
              })),
            ],
          })),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.chats.length === 0) {
          state.chats.push({
            id: nanoid(),
            model: textModels[0],
            input: '',
            attachments: [],
            synced: true,
            messages: [],
          });
          return;
        }

        // handles legacy state
        state?.chats.forEach((chat, _idx) => {
          if (
            Array.isArray(chat.model.config) ||
            chat.model.systemPromptSupport === undefined
          ) {
            state.setChatModel(
              chat.id,
              textModels.find((m) => m.id === chat.model.id) ?? textModels[0]
            );
          }
        });
      },
    }
  )
);

export const useChatStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useChatStore.persist.onHydrate(() =>
      setHydrated(false)
    );

    const unsubFinishHydration = useChatStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );

    setHydrated(useChatStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
