import { TextModel } from "@/lib/model/model.type";
import { getTextModels, textModels } from "@/lib/model/models";
import { ImageData } from "@/types/image-data.type";
import { Message } from "ai";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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
  dynamicModels: TextModel[];
  modelsLoaded: boolean;
  // Actions
  loadDynamicModels: () => Promise<void>;
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

const getInitialModel = (dynamicModels: TextModel[]): TextModel => {
  return dynamicModels.length > 0 ? dynamicModels[0] : textModels[0];
};

export const useChatStore = create<ChatStoreState>()(
  persist(
    immer((set, get) => ({
      chats: [
        {
          id: nanoid(),
          model: textModels[0], // Will be updated when dynamic models load
          messages: [],
          input: "",
          attachments: [],
          synced: true,
        },
      ],
      dynamicModels: [],
      modelsLoaded: false,

      loadDynamicModels: async () => {
        try {
          const models = await getTextModels();
          set((state) => {
            state.dynamicModels = models;
            state.modelsLoaded = true;
            
            // Update existing chats to use dynamic models if their current model doesn't exist
            state.chats.forEach(chat => {
              const currentModel = models.find(m => m.id === chat.model.id);
              if (!currentModel && models.length > 0) {
                chat.model = models[0];
              } else if (currentModel) {
                chat.model = currentModel;
              }
            });
          });
          console.log(`Loaded ${models.length} dynamic models`);
        } catch (error) {
          console.error('Failed to load dynamic models:', error);
          set((state) => {
            state.dynamicModels = textModels; // Fallback to static
            state.modelsLoaded = true;
          });
        }
      },

      addChat: () =>
        set((state) => {
          const models = state.modelsLoaded ? state.dynamicModels : textModels;
          state.chats.push({
            id: nanoid(),
            model: getInitialModel(models),
            input: "",
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
            const models = state.modelsLoaded ? state.dynamicModels : textModels;
            state.chats.push({
              id: nanoid(),
              model: getInitialModel(models),
              input: "",
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
          state.chats[chatIndex].input = "";
          state.chats[chatIndex].attachments = [];
          state.chats[chatIndex].messages = [];
        }),

      updateModelParams: (id: string, params: ChatParams) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          state.chats[chatIndex].model.config = {
            systemPrompt: params.systemPrompt ?? state.chats[chatIndex].model.config?.systemPrompt,
            maxTokens: {
              ...state.chats[chatIndex].model.config?.maxTokens,
              value: params.maxTokens ?? state.chats[chatIndex].model.config?.maxTokens.value,
            },
            temperature: {
              ...state.chats[chatIndex].model.config?.temperature,
              value: params.temperature ?? state.chats[chatIndex].model.config?.temperature.value,
            },
            topP: {
              ...state.chats[chatIndex].model.config?.topP,
              value: params.topP ?? state.chats[chatIndex].model.config?.topP.value,
            },
            reasoning: {
              ...state.chats[chatIndex].model.config?.reasoning,
              enabled: params.reasoning?.enabled ?? state.chats[chatIndex].model.config?.reasoning?.enabled ?? false,
              budgetTokens: {
                min: 0,
                max: 4096,
                default: 1024,
                ...state.chats[chatIndex].model.config?.reasoning?.budgetTokens,
                value:
                  params.reasoning?.budgetTokens ??
                  state.chats[chatIndex].model.config?.reasoning?.budgetTokens?.value ??
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
          state.chats[chatIndex].input = "";
          state.chats[chatIndex].attachments = [];
          state.chats[chatIndex].messages = [];
        });
      },

      resetChats: () => {
        set((state) => {
          for (const chat of state.chats) {
            // changing the chat id will reset the chat within the useChat hook
            chat.id = nanoid();
            chat.input = "";
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
              if (chat.synced && chat.model.inputModalities.includes("TEXT")) {
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
              if (chat.synced && chat.model.inputModalities.includes("IMAGE")) {
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
              chat.attachments = chat.attachments.filter((a) => a.name !== attachment.name);
            }
          } else {
            state.chats[chatIndex].attachments = state.chats[chatIndex].attachments.filter(
              (a) => a.name !== attachment.name,
            );
          }
        });
      },

      resetChatInput: (id: string) => {
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex === -1) return state;
          state.chats[chatIndex].input = "";
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
          // @ts-ignore
          state.chats[chatIndex].messages = messages;
        });
      },
    })),
    {
      name: "chat-store",
      storage: createJSONStorage(() => localStorage),
      version: 3, // Increment version for new dynamic models feature
      // don't store messages or attachments in local storage
      partialize: (state) => {
        return {
          chats: state.chats.map((chat) => ({
            ...chat,
            attachments: [],
            messages: [
              ...chat.messages.map((m) => ({
                ...m,
                data: m.role === "assistant" ? m.data : {},
              })),
            ],
          })),
          dynamicModels: [], // Don't persist dynamic models
          modelsLoaded: false,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.chats.length === 0) {
          state.chats.push({
            id: nanoid(),
            model: textModels[0],
            input: "",
            attachments: [],
            synced: true,
            messages: [],
          });
          return;
        }

        // handles legacy state
        state?.chats.forEach((chat, idx) => {
          if (Array.isArray(chat.model.config) || chat.model.systemPromptSupport === undefined) {
            const fallbackModel = textModels.find((m) => m.id === chat.model.id) ?? textModels[0];
            state.setChatModel(chat.id, fallbackModel);
          }
        });

        // Load dynamic models after rehydration
        setTimeout(() => {
          state?.loadDynamicModels();
        }, 100);
      },
    },
  ),
);

export const useChatStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useChatStore.persist.onHydrate(() => setHydrated(false));

    const unsubFinishHydration = useChatStore.persist.onFinishHydration(() => setHydrated(true));

    setHydrated(useChatStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};

// Hook to get available models (dynamic or static fallback)
export const useAvailableModels = () => {
  const { dynamicModels, modelsLoaded } = useChatStore();
  return modelsLoaded ? dynamicModels : textModels;
};
