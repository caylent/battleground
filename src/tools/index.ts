import type { ToolSet } from 'ai';
import { ImageGenerationTool } from './image-tool';

export const tools = {
  image_generation: ImageGenerationTool,
} satisfies ToolSet;
