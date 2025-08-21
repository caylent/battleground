import type { PromptSummary } from '@aws-sdk/client-bedrock-agent';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ImageModel } from '@/lib/model/model.type';
import { imageModels } from '@/lib/model/models';
import type { ImageData } from '@/types/image-data.type';

export type Prompt = Partial<PromptSummary> & {
  text: string;
  attachments: ImageData[];
};

type ImageStoreState = {
  // State
  prompt: string;
  results: {
    id: string;
    model: ImageModel;
    output: string;
  }[];
  // Actions
  addResults: () => void;
  removeResults: (id: string) => void;
  clearResults: (id?: string) => void;
  setResultsOutput: (id: string, text: string) => void;
  setModel: (id: string, model: ImageModel) => void;
  setPromptText: (text: string) => void;
};

export const useImageStore = create<ImageStoreState>()(
  persist(
    immer((set) => ({
      prompt: '',
      results: [
        {
          id: nanoid(),
          model: imageModels[0],
          output: '',
        },
      ],

      addResults: () => {
        set((state) => {
          state.results.push({
            id: nanoid(),
            model: imageModels[0],
            output: '',
          });
        });
      },

      removeResults: (id: string) => {
        set((state) => {
          const idx = state.results.findIndex((m) => m.id === id);
          if (idx === -1) return;
          state.results.splice(idx, 1);
          if (state.results.length === 0) {
            state.results.push({
              id: nanoid(),
              model: imageModels[0],
              output: '',
            });
          }
        });
      },

      clearResults: (id?: string) => {
        set((state) => {
          if (!id) {
            for (const result of state.results) {
              result.output = '';
            }
            return;
          }
          const idx = state.results.findIndex((m) => m.id === id);
          if (idx === -1) return;
          state.results[idx].output = '';
        });
      },

      setResultsOutput: (id: string, text: string) => {
        set((state) => {
          const idx = state.results.findIndex((m) => m.id === id);
          if (idx === -1) return;
          state.results[idx].output = text;
        });
      },

      setModel: (id: string, model: ImageModel) => {
        set((state) => {
          const idx = state.results.findIndex((m) => m.id === id);
          if (idx === -1) return;
          state.results[idx].model = model;
        });
      },

      setPromptText: (text: string) => {
        set((state) => {
          state.prompt = text;
        });
      },
    })),
    {
      name: 'image-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        return {
          results: state.results.map((result) => ({
            ...result,
            output: '',
          })),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.results?.length === 0) {
          state.results.push({
            id: nanoid(),
            model: imageModels[0],
            output: '',
          });
        }
      },
    }
  )
);

export const useImageStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useImageStore.persist.onHydrate(() =>
      setHydrated(false)
    );

    const unsubFinishHydration = useImageStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );

    setHydrated(useImageStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
