import type { ToolSet } from 'ai';
import { GlobalContextManagerTool } from './global-context-manager-tool';
import { ImageGenerationTool } from './image-tool';

export const tools = {
  image_generation: ImageGenerationTool,
  global_context_manager: GlobalContextManagerTool,
} satisfies ToolSet;
