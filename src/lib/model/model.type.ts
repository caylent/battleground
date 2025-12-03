import { ModelModality } from "@aws-sdk/client-bedrock";
import { ModelConfig } from "./model-config.type";
import { TextModelConfig } from "./model-configs";

export type Provider =
  | "Amazon"
  | "Stability AI"
  | "Anthropic"
  | "Deepseek"
  | "Cohere"
  | "Meta"
  | "Mistral"
  | "Nvidia"
  | "OpenAI"
  | "AI21"
  | "Luma Labs"
  | "Writer";

export type TextModelId =
  | "amazon.titan-text-lite-v1"
  | "amazon.titan-text-express-v1"
  | "amazon.titan-text-premier-v1:0"
  | "us.amazon.nova-micro-v1:0"
  | "us.amazon.nova-lite-v1:0"
  | "us.amazon.nova-pro-v1:0"
  | "us.amazon.nova-premier-v1:0"
  | "global.amazon.nova-2-lite-v1:0"
  | "global.amazon.nova-2-omni-v1:0"
  | "anthropic.claude-v2:1"
  | "anthropic.claude-3-haiku-20240307-v1:0"
  | "anthropic.claude-3-5-haiku-20241022-v1:0"
  | "global.anthropic.claude-haiku-4-5-20251001-v1:0"
  | "anthropic.claude-3-5-sonnet-20241022-v2:0"
  | "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
  | "us.anthropic.claude-sonnet-4-20250514-v1:0"
  | "global.anthropic.claude-sonnet-4-5-20250929-v1:0"
  | "anthropic.claude-3-opus-20240229-v1:0"
  | "us.anthropic.claude-opus-4-20250514-v1:0"
  | "global.anthropic.claude-opus-4-5-20251101-v1:0"
  | "us.deepseek.r1-v1:0"
  | "cohere.command-text-v14"
  | "cohere.command-light-text-v14"
  | "cohere.command-r-v1:0"
  | "cohere.command-r-plus-v1:0"
  | "meta.llama2-13b-chat-v1"
  | "meta.llama2-70b-chat-v1"
  | "meta.llama3-8b-instruct-v1:0"
  | "meta.llama3-70b-instruct-v1:0"
  | "meta.llama3-1-8b-instruct-v1:0"
  | "meta.llama3-1-70b-instruct-v1:0"
  | "meta.llama3-1-405b-instruct-v1:0"
  // The us. prefix allows these models to use cross region inference (https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html)
  // Currently these models only support on demand inference via this endpoint
  | "us.meta.llama3-2-1b-instruct-v1:0"
  | "us.meta.llama3-2-3b-instruct-v1:0"
  | "us.meta.llama3-2-11b-instruct-v1:0"
  | "us.meta.llama3-2-90b-instruct-v1:0"
  | "us.meta.llama3-3-70b-instruct-v1:0"
  | "us.meta.llama4-maverick-17b-instruct-v1:0"
  | "us.meta.llama4-scout-17b-instruct-v1:0"
  | "mistral.mistral-7b-instruct-v0:2"
  | "mistral.mixtral-8x7b-instruct-v0:1"
  | "mistral.mistral-large-2407-v1:0"
  | "meta/llama3-8b-instruct"
  | "meta/llama3-70b-instruct"
  | "ai21.jamba-instruct-v1:0"
  | "ai21.jamba-1-5-mini-v1:0"
  | "ai21.jamba-1-5-large-v1:0"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "o3-mini"
  | "us.writer.palmyra-x4-v1:0"
  | "us.writer.palmyra-x5-v1:0";

export type ImageModelId =
  | "amazon.titan-image-generator-v1"
  | "amazon.titan-image-generator-v2:0"
  | "amazon.nova-canvas-v1:0"
  | "stability.stable-image-core-v1:1"
  | "stability.sd3-5-large-v1:0"
  | "stability.stable-image-ultra-v1:1";

export type VideoModelId = "amazon.nova-reel-v1:0" | "luma.ray-v2:0";

export interface BaseModel {
  provider: Provider;
  name: string;
  id: string;
  region?: "us-east-1" | "us-west-2" | (string & {});
}

export type TextModel = BaseModel & {
  id: TextModelId;
  inputCostPerToken?: number;
  outputCostPerToken?: number;
  inputModalities: ModelModality[];
  outputModalities: ModelModality[];
  config: TextModelConfig;
  systemPromptSupport: boolean;
};

export type ImageModel = BaseModel & {
  id: ImageModelId;
  description?: string;
  inputModalities: ModelModality[];
  costPerImage?: number;
  config: ModelConfig;
};

export type VideoModel = BaseModel & {
  id: VideoModelId;
  costPerSecond?: number;
  config: ModelConfig;
};
