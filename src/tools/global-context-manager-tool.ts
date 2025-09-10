import { tool } from 'ai';
import z from 'zod';

const inputSchema = z.object({
  prompt: z.string(),
});

export type GlobalContextManagerToolInput = z.infer<typeof inputSchema>;

const outputSchema = z.object({
  status: z.enum(['loading', 'success', 'error']),
  message: z.string(),
  context: z.optional(z.string()),
});

export type GlobalContextManagerToolOutput = z.infer<typeof outputSchema>;

export const GlobalContextManagerTool = tool({
  name: 'global_context_manager',
  description: `
    Gives access to Caylent's global context including project information. 
    Use this tool anytime the user is asking for Caylent specific information or project information.
  `,
  inputSchema,
  outputSchema,
  async *execute() {
    yield {
      status: 'loading' as const,
      message: "Searching Caylent's global context...",
      context: undefined,
    };
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      status: 'success' as const,
      message: "Found Caylent's global context",
      context: 'TODO: Implement',
    };
  },
});
