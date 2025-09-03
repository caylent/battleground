import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { modelSchema } from "./schema";

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
  args: { id: v.id("chats") },
  handler: async (ctx, args) => {
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
    userId: v.string(),
    model: v.optional(modelSchema),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const chatId = await ctx.db.insert("chats", {
      name: args.name,
      userId: args.userId,
      messages: [],
      messageCount: 0,
      updatedAt: now,
      model: args.model,
    });
    
    return chatId;
  },
});

/**
 * Consolidated update method for chats with optional parameters
 * Accepts any combination of fields to update
 */
export const update = mutation({
  args: {
    id: v.id("chats"),
    messages: v.optional(v.array(v.any())),
    name: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
    model: v.optional(modelSchema),
    activeStreamId: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateFields } = args;
    
    const fieldsToUpdate: Record<string, any> = {};
    
    // Handle messages update with additional computed fields
    if (updateFields.messages !== undefined) {
      fieldsToUpdate.messages = updateFields.messages;
      fieldsToUpdate.messageCount = updateFields.messages.length;
    }
    
    // Handle name update
    if (updateFields.name !== undefined) {
      fieldsToUpdate.name = updateFields.name;
    }
    
    // Handle isFavorite update
    if (updateFields.isFavorite !== undefined) {
      fieldsToUpdate.isFavorite = updateFields.isFavorite;
    }
    
    // Handle activeStreamId update
    if (updateFields.activeStreamId !== undefined) {
      fieldsToUpdate.activeStreamId = updateFields.activeStreamId;
    }
    
    // Handle isArchived update
    if (updateFields.isArchived !== undefined) {
      fieldsToUpdate.isArchived = updateFields.isArchived;
    }

    // Handle modelId update
    if (updateFields.model !== undefined) {
      fieldsToUpdate.model = updateFields.model;
    }

    // Always update the timestamp when any field is modified
    if (Object.keys(fieldsToUpdate).length > 0) {
      fieldsToUpdate.updatedAt = Date.now();
    }
    
    await ctx.db.patch(id, fieldsToUpdate);
    return id;
  },
});

/**
 * Delete a message and all messages after it
 */
export const deleteMessageAndAfter = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Find the index of the message to delete
    const messageIndex = chat.messages.findIndex(
      (message: any) => message.id === args.messageId
    );

    if (messageIndex === -1) {
      throw new Error("Message not found");
    }

    // Keep only messages before the target message (slice up to but not including the target)
    const updatedMessages = chat.messages.slice(0, messageIndex);

    // Update the chat with the truncated messages
    await ctx.db.patch(args.chatId, {
      messages: updatedMessages,
      messageCount: updatedMessages.length,
      updatedAt: Date.now(),
    });

    return {
      chatId: args.chatId,
      deletedFromIndex: messageIndex,
      remainingMessageCount: updatedMessages.length,
    };
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
      userId: originalChat.userId,
      messages: branchedMessages,
      updatedAt: now,
      messageCount: branchedMessages.length,
      parentChatId: args.id, // Store reference to original chat
      branchFromIndex: args.branchFromIndex, // Store the branching point
    });
    
    return newChatId;
  },
});

/**
 * Archive old chats (soft delete by adding archived flag)
 * @deprecated Use `update` method instead. Will be removed in future version.
 */
export const archive = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runMutation(api.chats.update, {
      id: args.id,
      isArchived: true,
    });
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
