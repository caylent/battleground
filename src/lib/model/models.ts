export type Provider =
  | 'Amazon'
  | 'Stability AI'
  | 'Anthropic'
  | 'Deepseek'
  | 'Cohere'
  | 'Meta'
  | 'Mistral'
  | 'OpenAI'
  | 'AI21'
  | 'Luma Labs'
  | 'Writer'
  | (string & {});

export type ImageModelId =
  | 'amazon.titan-image-generator-v1'
  | 'amazon.titan-image-generator-v2:0'
  | 'amazon.nova-canvas-v1:0'
  | 'stability.stable-image-core-v1:1'
  | 'stability.sd3-5-large-v1:0'
  | 'stability.stable-image-ultra-v1:1';

export type VideoModelId = 'amazon.nova-reel-v1:0' | 'luma.ray-v2:0';

export type TextModelCapabilities =
  | 'IMAGE'
  | 'TOOLS'
  | 'REASONING'
  | 'VIDEO'
  | (string & {});

export type TextModel = {
  provider: Provider;
  name: string;
  id: string;
  region?: 'us-east-1' | 'us-west-2' | (string & {});
  inputCostPerToken?: number;
  outputCostPerToken?: number;
  capabilities?: TextModelCapabilities[];
};

export const DEFAULT_TEXT_MODEL_ID =
  'us.anthropic.claude-sonnet-4-20250514-v1:0';

export const textModels = [
  {
    provider: 'Amazon',
    id: 'us.amazon.nova-micro-v1:0',
    region: 'us-east-1',
    name: 'Nova Micro',
    inputCostPerToken: 0.000_003_5 / 1e3,
    outputCostPerToken: 0.000_14 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Amazon',
    id: 'us.amazon.nova-lite-v1:0',
    region: 'us-east-1',
    name: 'Nova Lite',
    inputCostPerToken: 0.000_06 / 1e3,
    outputCostPerToken: 0.000_24 / 1e3,
    capabilities: ['IMAGE', 'TOOLS', 'VIDEO'],
  },
  {
    provider: 'Amazon',
    id: 'us.amazon.nova-pro-v1:0',
    region: 'us-east-1',
    name: 'Nova Pro',
    inputCostPerToken: 0.0008 / 1e3,
    outputCostPerToken: 0.0032 / 1e3,
    capabilities: ['IMAGE', 'TOOLS', 'VIDEO'],
  },
  {
    provider: 'Amazon',
    id: 'us.amazon.nova-premier-v1:0',
    region: 'us-east-1',
    name: 'Nova Premier',
    inputCostPerToken: 0.0025 / 1e3,
    outputCostPerToken: 0.0125 / 1e3,
    capabilities: ['IMAGE', 'REASONING', 'TOOLS', 'VIDEO'],
  },
  {
    provider: 'Anthropic',
    id: 'anthropic.claude-3-haiku-20240307-v1:0',
    name: 'Claude 3 Haiku',
    inputCostPerToken: 0.000_25 / 1e3,
    outputCostPerToken: 0.001_25 / 1e3,
    capabilities: ['TOOLS', 'IMAGE'],
  },
  {
    provider: 'Anthropic',
    id: 'anthropic.claude-3-5-haiku-20241022-v1:0',
    name: 'Claude 3.5 Haiku',
    region: 'us-west-2',
    inputCostPerToken: 0.0008 / 1e3,
    outputCostPerToken: 0.0004 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Anthropic',
    id: 'anthropic.claude-3-sonnet-20240229-v1:0',
    name: 'Claude 3 Sonnet',
    inputCostPerToken: 0.003 / 1e3,
    outputCostPerToken: 0.015 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'Anthropic',
    id: 'anthropic.claude-3-opus-20240229-v1:0',
    name: 'Claude 3 Opus',
    region: 'us-west-2',
    inputCostPerToken: 0.015 / 1e3,
    outputCostPerToken: 0.075 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'Anthropic',
    id: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    name: 'Claude 3.5 Sonnet',
    inputCostPerToken: 0.003 / 1e3,
    outputCostPerToken: 0.015 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'Anthropic',
    id: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    region: 'us-west-2',
    name: 'Claude 3.5 Sonnet V2',
    inputCostPerToken: 0.003 / 1e3,
    outputCostPerToken: 0.015 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'Anthropic',
    id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    name: 'Claude 3.7 Sonnet',
    inputCostPerToken: 0.003 / 1e3,
    outputCostPerToken: 0.015 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'Anthropic',
    id: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    region: 'us-east-1',
    name: 'Claude 4 Sonnet',
    inputCostPerToken: 0.003 / 1e3,
    outputCostPerToken: 0.015 / 1e3,
    capabilities: ['IMAGE', 'TOOLS', 'REASONING'],
  },
  {
    provider: 'Anthropic',
    id: 'us.anthropic.claude-opus-4-20250514-v1:0',
    region: 'us-east-1',
    name: 'Claude 4 Opus',
    inputCostPerToken: 0.015 / 1e3,
    outputCostPerToken: 0.075 / 1e3,
    capabilities: ['IMAGE', 'TOOLS', 'REASONING'],
  },
  {
    provider: 'Anthropic',
    id: 'us.anthropic.claude-opus-4-1-20250805-v1:0',
    region: 'us-east-1',
    name: 'Claude 4.1 Opus',
    inputCostPerToken: 0.015 / 1e3,
    outputCostPerToken: 0.075 / 1e3,
    capabilities: ['IMAGE', 'TOOLS', 'REASONING'],
  },
  {
    provider: 'Deepseek',
    id: 'us.deepseek.r1-v1:0',
    name: 'Deepseek R1',
    region: 'us-west-2',
    inputCostPerToken: 0.001_35 / 1e3,
    outputCostPerToken: 0.0054 / 1e3,
    capabilities: ['TOOLS', 'REASONING'],
  },
  {
    provider: 'Cohere',
    id: 'cohere.command-r-v1:0',
    name: 'Command R',
    region: 'us-west-2',
    inputCostPerToken: 0.0005 / 1e3,
    outputCostPerToken: 0.0015 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Cohere',
    id: 'cohere.command-r-plus-v1:0',
    name: 'Command R+',
    inputCostPerToken: 0.003 / 1e3,
    outputCostPerToken: 0.015 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'meta.llama3-8b-instruct-v1:0',
    name: 'Llama 3 8B Instruct',
    inputCostPerToken: 0.0003 / 1e3,
    outputCostPerToken: 0.0006 / 1e3,
  },
  {
    provider: 'Meta',
    id: 'meta.llama3-70b-instruct-v1:0',
    name: 'Llama 3 70B Instruct',
    inputCostPerToken: 0.002_65 / 1e3,
    outputCostPerToken: 0.0035 / 1e3,
  },
  {
    provider: 'Meta',
    id: 'meta.llama3-1-8b-instruct-v1:0',
    name: 'Llama 3.1 8B Instruct',
    region: 'us-west-2',
    inputCostPerToken: 0.000_22 / 1e3,
    outputCostPerToken: 0.000_22 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'meta.llama3-1-70b-instruct-v1:0',
    name: 'Llama 3.1 70B Instruct',
    region: 'us-west-2',
    inputCostPerToken: 0.000_72 / 1e3,
    outputCostPerToken: 0.000_72 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'meta.llama3-1-405b-instruct-v1:0',
    name: 'Llama 3.1 405B Instruct',
    region: 'us-west-2',
    inputCostPerToken: 0.0024 / 1e3,
    outputCostPerToken: 0.0024 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'us.meta.llama3-2-1b-instruct-v1:0',
    name: 'Llama 3.2 1B Instruct',
    region: 'us-west-2',
    inputCostPerToken: 0.0001 / 1e3,
    outputCostPerToken: 0.0001 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'us.meta.llama3-2-3b-instruct-v1:0',
    name: 'Llama 3.2 3B Instruct',
    region: 'us-west-2',
    inputCostPerToken: 0.000_15 / 1e3,
    outputCostPerToken: 0.000_15 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'us.meta.llama3-2-11b-instruct-v1:0',
    name: 'Llama 3.2 11B Instruct',
    region: 'us-west-2',
    inputCostPerToken: 0.000_16 / 1e3,
    outputCostPerToken: 0.000_16 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'us.meta.llama3-2-90b-instruct-v1:0',
    name: 'Llama 3.2 90B Instruct',
    region: 'us-west-2',
    inputCostPerToken: 0.000_72 / 1e3,
    outputCostPerToken: 0.000_72 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'us.meta.llama3-3-70b-instruct-v1:0',
    name: 'Llama 3.3 70B Instruct',
    region: 'us-west-2',
    inputCostPerToken: 0.000_72 / 1e3,
    outputCostPerToken: 0.000_72 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'us.meta.llama4-maverick-17b-instruct-v1:0',
    name: 'Llama 4 Maverick 17B Instruct',
    inputCostPerToken: 0.000_24 / 1e3,
    outputCostPerToken: 0.000_97 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'Meta',
    id: 'us.meta.llama4-scout-17b-instruct-v1:0',
    name: 'Llama 4 Scout 17B Instruct',
    inputCostPerToken: 0.000_17 / 1e3,
    outputCostPerToken: 0.000_66 / 1e3,
    capabilities: ['IMAGE', 'TOOLS'],
  },
  {
    provider: 'OpenAI',
    id: 'gpt-5',
    name: 'GPT-5',
    inputCostPerToken: 0.001_25 / 1e3,
    outputCostPerToken: 0.01 / 1e3,
    capabilities: ['IMAGE', 'REASONING', 'TOOLS'],
  },
  {
    provider: 'OpenAI',
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    inputCostPerToken: 0.000_25 / 1e3,
    outputCostPerToken: 0.002 / 1e3,
    capabilities: ['IMAGE', 'TOOLS', 'REASONING'],
  },
  {
    provider: 'OpenAI',
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    inputCostPerToken: 0.000_05 / 1e3,
    outputCostPerToken: 0.0004 / 1e3,
    capabilities: ['IMAGE', 'TOOLS', 'REASONING'],
  },
  {
    provider: 'AI21',
    id: 'ai21.jamba-instruct-v1:0',
    name: 'Jamba-Instruct',
    inputCostPerToken: 0.0005 / 1e3,
    outputCostPerToken: 0.0007 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'AI21',
    id: 'ai21.jamba-1-5-mini-v1:0',
    name: 'Jamba 1.5 Mini',
    inputCostPerToken: 0.0002 / 1e3,
    outputCostPerToken: 0.0004 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'AI21',
    id: 'ai21.jamba-1-5-large-v1:0',
    name: 'Jamba 1.5 Large',
    inputCostPerToken: 0.002 / 1e3,
    outputCostPerToken: 0.008 / 1e3,
    capabilities: ['TOOLS'],
  },
  {
    provider: 'Writer',
    id: 'us.writer.palmyra-x4-v1:0',
    name: 'Palmyra X4',
    region: 'us-west-2',
  },
  {
    provider: 'Writer',
    id: 'us.writer.palmyra-x5-v1:0',
    name: 'Palmyra X5',
    region: 'us-west-2',
  },
] satisfies TextModel[];

export const DEFAULT_TEXT_MODEL =
  textModels.find((m) => m.id === DEFAULT_TEXT_MODEL_ID) ?? textModels[0];
