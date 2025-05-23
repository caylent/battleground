import { ModelConfig } from "./model-config.type";

export type TextModelConfig = {
  systemPrompt: string;
  maxTokens: {
    value: number;
    min: number;
    max: number;
    default: number;
  };
  temperature: {
    value: number;
    min: number;
    max: number;
    default: number;
  };
  topP: {
    value: number;
    min: number;
    max: number;
    default: number;
  };
  reasoning?: {
    enabled: boolean;
    budgetTokens: {
      value: number;
      min: number;
      max: number;
      default: number;
    };
  };
};

export const titanTextLiteConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 4096,
    default: 512,
  },
  temperature: {
    value: 0.7,
    min: 0,
    max: 1,
    default: 0.7,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const titanTextExpressConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 8192,
    default: 512,
  },
  temperature: {
    value: 0.7,
    min: 0,
    max: 1,
    default: 0.7,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const titanTextPremierConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 3072,
    default: 512,
  },
  temperature: {
    value: 0.7,
    min: 0,
    max: 1,
    default: 0.7,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const novaConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 5120,
    default: 512,
  },
  temperature: {
    value: 0.7,
    min: 0,
    max: 1,
    default: 0.7,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const anthropicClaudeDefaultConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 4096,
    default: 512,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
  topP: {
    value: 0.999,
    min: 0,
    max: 1,
    default: 0.999,
  },
};

export const anthropicClaudeSonnet35Config: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 8192,
    default: 512,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
  topP: {
    value: 0.999,
    min: 0,
    max: 1,
    default: 0.999,
  },
};

export const antrhopicClaudeSonnet37Config: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 8192,
    min: 1,
    max: 64000, // Note: this is only in extended thinking mode
    default: 512,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
  topP: {
    value: 0.999,
    min: 0,
    max: 1,
    default: 0.999,
  },
  reasoning: {
    enabled: false,
    budgetTokens: {
      value: 1024,
      min: 1024,
      max: 64000,
      default: 1024,
    },
  },
};

export const anthropicClaude4SonnetConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 4096,
    min: 1,
    max: 128000,
    default: 4096,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
  topP: {
    value: 0.999,
    min: 0,
    max: 1,
    default: 0.999,
  },
  reasoning: {
    enabled: false,
    budgetTokens: {
      value: 4096,
      min: 1024,
      max: 128000,
      default: 4096,
    },
  },
};

export const anthropicClaude4OpusConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 4096,
    min: 1,
    max: 128000,
    default: 4096,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
  topP: {
    value: 0.999,
    min: 0,
    max: 1,
    default: 0.999,
  },
  reasoning: {
    enabled: false,
    budgetTokens: {
      value: 4096,
      min: 1024,
      max: 128000,
      default: 4096,
    },
  },
};

export const cohereCommandRModelConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 4096,
    default: 512,
  },
  temperature: {
    value: 0.3,
    min: 0,
    max: 1,
    default: 0.3,
  },
  topP: {
    value: 0.75,
    min: 0.01,
    max: 0.99,
    default: 0.75,
  },
};

export const ai21JambaInstructConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 4096,
    default: 512,
  },
  temperature: {
    value: 0.7,
    min: 0,
    max: 1,
    default: 0.7,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const llamaDefaultModelConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 2048,
    default: 512,
  },
  temperature: {
    value: 0.5,
    min: 0,
    max: 1,
    default: 0.5,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const mistral7bInstructConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 8192,
    default: 512,
  },
  temperature: {
    value: 0.5,
    min: 0,
    max: 1,
    default: 0.5,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const mistral8x7bInstructConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 4096,
    default: 512,
  },
  temperature: {
    value: 0.5,
    min: 0,
    max: 1,
    default: 0.5,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const mistralLargeConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 8192,
    min: 1,
    max: 8192,
    default: 8192,
  },
  temperature: {
    value: 0.7,
    min: 0,
    max: 1,
    default: 0.7,
  },
  topP: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
};

export const openAiGpt4oConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 512,
    min: 1,
    max: 4096,
    default: 512,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 2,
    default: 1,
  },
  topP: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
};

export const openAiGpt4ominiConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 2048,
    min: 1,
    max: 16384,
    default: 2048,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 2,
    default: 1,
  },
  topP: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
};

export const o3MiniConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 2048,
    min: 1,
    max: 16384,
    default: 2048,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 2,
    default: 1,
  },
  topP: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
};

export const deepseekR1Config: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 8192,
    min: 1,
    max: 32768,
    default: 8192,
  },
  temperature: {
    value: 0.7,
    min: 0,
    max: 1,
    default: 0.7,
  },
  topP: {
    value: 0.9,
    min: 0,
    max: 1,
    default: 0.9,
  },
};

export const writerModelConfig: TextModelConfig = {
  systemPrompt: "",
  maxTokens: {
    value: 2048,
    min: 1,
    max: 8192,
    default: 2048,
  },
  temperature: {
    value: 1,
    min: 0,
    max: 2,
    default: 1,
  },
  topP: {
    value: 1,
    min: 0,
    max: 1,
    default: 1,
  },
};

// Image Models

export const titanImageModelConfig: ModelConfig = [
  {
    type: "number",
    name: "numberOfImages",
    label: "Number of Images",
    value: "1",
    min: 1,
    max: 5,
  },
  {
    type: "number",
    name: "cfgScale",
    label: "Config Scale",
    description:
      "Specifies how strongly the generated image should adhere to the prompt. Use a lower value to introduce more randomness in the generation.",
    value: "8.0",
    min: 1.1,
    max: 10.0,
  },
  {
    type: "number",
    name: "height",
    label: "Height",
    value: "1024",
    min: 320,
    max: 1408,
  },
  {
    type: "number",
    name: "width",
    label: "Width",
    value: "1024",
    min: 320,
    max: 1408,
  },
  {
    type: "number",
    name: "seed",
    label: "Seed",
    description:
      "Use to control and reproduce results. Determines the initial noise setting. Use the same seed and the same settings as a previous run to allow inference to create a similar image.",
    value: "0",
    min: 0,
    max: 2147483646,
  },
];

export const novaCanvasModelConfig: ModelConfig = [
  {
    type: "number",
    name: "numberOfImages",
    label: "Number of Images",
    value: "1",
    min: 1,
    max: 5,
  },
  {
    type: "number",
    name: "cfgScale",
    label: "Config Scale",
    description:
      "Specifies how strongly the generated image should adhere to the prompt. Use a lower value to introduce more randomness in the generation.",
    value: "8.0",
    min: 1.1,
    max: 10.0,
  },
  {
    type: "number",
    name: "height",
    label: "Height",
    value: "1024",
    min: 320,
    max: 1408,
  },
  {
    type: "number",
    name: "width",
    label: "Width",
    value: "1024",
    min: 320,
    max: 1408,
  },
  {
    type: "number",
    name: "seed",
    label: "Seed",
    description:
      "Use to control and reproduce results. Determines the initial noise setting. Use the same seed and the same settings as a previous run to allow inference to create a similar image.",
    value: "0",
    min: 0,
    max: 2147483646,
  },
];

export const sdxlModelConfig: ModelConfig = [
  {
    type: "number",
    name: "cfg_scale",
    label: "Config Scale",
    description:
      "Determines how much the final image portrays the prompt. Use a lower number to increase randomness in the generation.",
    value: "7",
    min: 0,
    max: 35,
  },
  {
    type: "enum",
    name: "clip_guidance_preset",
    label: "Clip Guidance Preset",
    description:
      "CLIP Guidance is a technique that uses the CLIP neural network to guide the generation of images to be more in-line with your included prompt, which often results in improved coherency.",
    options: ["FAST_BLUE", "FAST_GREEN", "NONE", "SIMPLE SLOW", "SLOWER", "SLOWEST"],
  },
  {
    type: "number",
    name: "height",
    label: "Height",
    description: "Height of the generated image. Must be divisible by 64",
    value: "1024",
    min: 320,
    max: 1408,
  },
  {
    type: "number",
    name: "width",
    label: "Width",
    description: "Width of the generated image. Must be divisible by 64",
    value: "1024",
    min: 320,
    max: 1408,
  },
  {
    type: "enum",
    name: "sampler",
    label: "Sampler",
    description:
      "The sampler to use for the diffusion process. If this value is omitted, the model automatically selects an appropriate sampler for you.",
    value: undefined,
    options: [
      "DDIM",
      "DDPM",
      "K_DPMPP_2M",
      "K_DPMPP_2S_ANCESTRAL",
      "K_DPM_2",
      "K_DPM_2_ANCESTRAL",
      "K_EULER",
      "K_EULER_ANCESTRAL",
      "K_HEUN",
      "K_LMS",
    ],
  },
  {
    type: "enum",
    name: "style_preset",
    label: "Style Preset",
    options: [
      "3d-model",
      "analog-film",
      "anime",
      "cinematic",
      "comic-book",
      "digital-art",
      "enhance",
      "fantasy-art",
      "isometric",
      "line-art",
      "low-poly",
      "modeling-compound",
      "neon-punk",
      "origami",
      "photographic",
      "pixel-art",
      "tile-texture",
    ],
  },
];

export const stabilityModelConfig: ModelConfig = [
  {
    type: "enum",
    name: "aspect_ratio",
    label: "Aspect Ratio",
    description: "The aspect ratio of the generated image",
    options: ["16:9", "1:1", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"],
    value: "1:1",
  },
];

// Video Models

export const lumaRay2ModelConfig: ModelConfig = [
  {
    type: "enum",
    name: "aspect_ratio",
    label: "Aspect Ratio",
    options: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"],
    value: "16:9",
  },
  {
    type: "enum",
    name: "resolution",
    label: "Resolution",
    options: ["720p", "540p"],
    value: "720p",
  },
  {
    type: "enum",
    name: "dimensions",
    label: "Dimensions",
    options: ["1080x1920", "1080x2400", "1440x3200", "1440x3840", "2160x4096", "2160x4320"],
    value: "1080x1920",
  },
  {
    type: "enum",
    name: "duration",
    label: "Duration",
    options: ["5s", "9s"],
    value: "5s",
  },
];
