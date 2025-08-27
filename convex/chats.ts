import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// Messages use v.any() for maximum flexibility as per original schema

// QUERIES (Read operations)

/**
 * Get all chats with pagination support
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 20, 100); // Cap at 100 for performance
    
    let query = ctx.db.query("chats").order("desc");
    
    if (args.cursor) {
      // Use cursor for pagination (last item's creation time)
      query = query.filter((q) => q.lt(q.field("_creationTime"), parseInt(args.cursor!)));
    }
    
    const chats = await query.take(limit);
    
    // Get the cursor for the next page
    const nextCursor = chats.length === limit 
      ? chats[chats.length - 1]._creationTime.toString()
      : null;
    
    return {
      chats,
      nextCursor,
      hasMore: chats.length === limit,
      total: chats.length, // This would be total in current page
    };
  },
});

/**
 * Get all chats (without pagination) - for simple use cases
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("chats").order("desc").collect();
  },
});

/**
 * Get a specific chat by ID
 */
export const getById = query({
  args: { id: v.union(v.id("chats"), v.literal("new")) },
  handler: async (ctx, args) => {
    if (args.id === "new") {
      return null;
    }
    return await ctx.db.get(args.id);
  },
});

/**
 * Search chats by name (case-insensitive)
 */
export const searchByName = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const allChats = await ctx.db.query("chats").collect();
    
    const filteredChats = allChats
      .filter((chat) =>
        chat.name.toLowerCase().includes(args.searchTerm.toLowerCase())
      )
      .slice(0, limit);
    
    return filteredChats;
  },
});

/**
 * Get recent chats (most recently updated)
 */
export const getRecent = query({
  args: { 
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    return await ctx.db
      .query("chats")
      .order("desc")
      .take(limit);
  },
});

/**
 * Get chats count
 */
export const count = query({
  args: {},
  handler: async (ctx) => {
    const chats = await ctx.db.query("chats").collect();
    return chats.length;
  },
});

/**
 * Get chat statistics
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const chats = await ctx.db.query("chats").collect();
    
    const totalChats = chats.length;
    const totalMessages = chats.reduce((sum, chat) => sum + (chat.messageCount || chat.messages.length), 0);
    const averageMessagesPerChat = totalChats > 0 ? totalMessages / totalChats : 0;
    
    // Find most active chat
    const mostActiveChat = chats.reduce((max, chat) => {
      const messageCount = chat.messageCount || chat.messages.length;
      const maxMessageCount = max.messageCount || max.messages.length;
      return messageCount > maxMessageCount ? chat : max;
    }, chats[0]);
    
    return {
      totalChats,
      totalMessages,
      averageMessagesPerChat: Math.round(averageMessagesPerChat * 100) / 100,
      mostActiveChat: mostActiveChat ? {
        id: mostActiveChat._id,
        name: mostActiveChat.name,
        messageCount: mostActiveChat.messageCount || mostActiveChat.messages.length,
      } : null,
    };
  },
});

// MUTATIONS (Write operations)

/**
 * Create a new chat
 */
export const create = mutation({
  args: {
    name: v.string(),
    initialMessages: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const messages = args.initialMessages || [];

    const chatId = await ctx.db.insert("chats", {
      name: args.name,
      messages,
      status: "idle",
      updatedAt: now,
      messageCount: messages.length,
    });
    
    return chatId;
  },
});

/**
 * Update chat messages (replaces all messages)
 */
export const updateMessages = mutation({
  args: {
    id: v.id("chats"),
    messages: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, messages } = args;
    
    const fieldsToUpdate: Record<string, any> = {
      messages,
      updatedAt: Date.now(),
      messageCount: messages.length,
      status: "idle",
    };
    
    await ctx.db.patch(id, fieldsToUpdate);
    return id;
  },
});

/**
 * Update chat status
 */
export const updateStatus = mutation({
  args: {
    id: v.id("chats"),
    status: v.union(v.literal("idle"), v.literal("in-progress")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

/**
 * Update chat name only
 */
export const updateName = mutation({
  args: {
    id: v.id("chats"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

/**
 * Update chat isFavorite flag
 */
export const updateIsFavorite = mutation({
  args: {
    id: v.id("chats"),
    isFavorite: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isFavorite: args.isFavorite });
  },
});

/**
 * Delete a chat
 */
export const remove = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Bulk delete chats
 */
export const bulkDelete = mutation({
  args: { ids: v.array(v.id("chats")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return args.ids;
  },
});

/**
 * Branch a chat from a specific message point
 */
export const branch = mutation({
  args: {
    id: v.id("chats"),
    branchFromIndex: v.optional(v.number()), // Index of the last message to include in the branch
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const originalChat = await ctx.db.get(args.id);
    if (!originalChat) {
      throw new Error("Chat not found");
    }

    const now = Date.now();
    const branchName = args.newName || `${originalChat.name} (Branch)`;
    
    // If branchFromIndex is provided, slice messages up to that point (inclusive)
    // If not provided, include all messages (same as duplicate)
    let branchedMessages = originalChat.messages;
    if (args.branchFromIndex !== undefined) {
      if (args.branchFromIndex < 0 || args.branchFromIndex >= originalChat.messages.length) {
        throw new Error("Invalid branch index");
      }
      branchedMessages = originalChat.messages.slice(0, args.branchFromIndex + 1);
    }
    
    const newChatId = await ctx.db.insert("chats", {
      name: branchName,
      messages: branchedMessages,
      updatedAt: now,
      messageCount: branchedMessages.length,
      status: "idle",
      parentChatId: args.id, // Store reference to original chat
      branchFromIndex: args.branchFromIndex, // Store the branching point
    });
    
    return newChatId;
  },
});

/**
 * Archive old chats (soft delete by adding archived flag)
 * This requires updating the schema to include an archived field
 */
export const archive = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx, args) => {
    // For now, we'll just update the name to indicate archived status
    const chat = await ctx.db.get(args.id);
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    await ctx.db.patch(args.id, {
      updatedAt: Date.now(),
      isArchived: true,
    });
    
    return args.id;
  },
});

/**
 * Get chat with message pagination (for very large chats)
 */
export const getChatWithMessagePagination = query({
  args: {
    id: v.id("chats"),
    messageOffset: v.optional(v.number()),
    messageLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.id);
    if (!chat) {
      return null;
    }
    
    const offset = args.messageOffset || 0;
    const limit = args.messageLimit || 50;
    
    const paginatedMessages = chat.messages.slice(offset, offset + limit);
    
    return {
      ...chat,
      messages: paginatedMessages,
      pagination: {
        offset,
        limit,
        total: chat.messages.length,
        hasMore: offset + limit < chat.messages.length,
      },
    };
  },
});
