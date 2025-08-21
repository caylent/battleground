import type { ToolSet } from 'ai';
import { ImageGenerationTool } from './image-tool';

export const tools: ToolSet = {
  image_generation: ImageGenerationTool,
};
