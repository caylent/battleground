import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// QUERIES (Read operations)

/**
 * Get all prompts
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("prompts").order("desc").collect();
  },
});

/**
 * Get a specific prompt by ID
 */
export const getById = query({
  args: { id: v.id("prompts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Search prompts by name (case-insensitive)
 */
export const searchByName = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const prompts = await ctx.db.query("prompts").collect();
    return prompts.filter((prompt) =>
      prompt.name.toLowerCase().includes(args.searchTerm.toLowerCase())
    );
  },
});

// MUTATIONS (Write operations)

/**
 * Create a new prompt
 */
export const create = mutation({
  args: {
    name: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const promptId = await ctx.db.insert("prompts", {
      name: args.name,
      prompt: args.prompt,
      updatedAt: now,
    });
    return promptId;
  },
});

/**
 * Update an existing prompt
 */
export const update = mutation({
  args: {
    id: v.id("prompts"),
    name: v.optional(v.string()),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Only include fields that are being updated
    const fieldsToUpdate: Record<string, any> = {
      updatedAt: Date.now(),
    };
    
    if (updates.name !== undefined) {
      fieldsToUpdate.name = updates.name;
    }
    
    if (updates.prompt !== undefined) {
      fieldsToUpdate.prompt = updates.prompt;
    }

    await ctx.db.patch(id, fieldsToUpdate);
    return id;
  },
});

/**
 * Delete a prompt
 */
export const remove = mutation({
  args: { id: v.id("prompts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Bulk delete prompts
 */
export const bulkDelete = mutation({
  args: { ids: v.array(v.id("prompts")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return args.ids;
  },
});

/**
 * Duplicate a prompt (creates a copy with a new name)
 */
export const duplicate = mutation({
  args: {
    id: v.id("prompts"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const originalPrompt = await ctx.db.get(args.id);
    if (!originalPrompt) {
      throw new Error("Prompt not found");
    }

    const now = Date.now();
    const duplicatedName = args.newName || `${originalPrompt.name} (Copy)`;
    
    const newPromptId = await ctx.db.insert("prompts", {
      name: duplicatedName,
      prompt: originalPrompt.prompt,
      updatedAt: now,
    });
    
    return newPromptId;
  },
});

/**
 * Get prompts count
 */
export const count = query({
  args: {},
  handler: async (ctx) => {
    const prompts = await ctx.db.query("prompts").collect();
    return prompts.length;
  },
});

/**
 * Get prompts with pagination
 */
export const paginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let query = ctx.db.query("prompts").order("desc");
    
    if (args.cursor) {
      // For pagination, you'd typically use the cursor to continue from where you left off
      // This is a simplified implementation
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }
    
    const prompts = await query.take(limit);
    
    // Get the cursor for the next page (last item's creation time)
    const nextCursor = prompts.length === limit 
      ? prompts[prompts.length - 1]._creationTime.toString()
      : null;
    
    return {
      prompts,
      nextCursor,
      hasMore: prompts.length === limit,
    };
  },
});
