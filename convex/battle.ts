import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { modelSchema } from "./schema";

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('battles')
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    chats: v.optional(v.array(v.object({
      id: v.string(),
      model: modelSchema,
    })))
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("battles", { userId: args.userId, chats: args.chats ?? [] });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("battles"),
    chats: v.optional(v.array(v.object({
      id: v.string(),
      model: modelSchema,
    })))
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { chats: args.chats });
  },
});

export const updateChat = mutation({
  args: {
    battleId: v.id("battles"),
    chatId: v.string(),
    model: modelSchema,
  },
  handler: async (ctx, args) => {
    const battle = await ctx.db.get(args.battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }
    const updateIndex = battle.chats.findIndex(c => c.id === args.chatId);
    if (updateIndex === -1) {
      throw new Error("Chat not found");
    }
    battle.chats[updateIndex].model = args.model;
    await ctx.db.patch(args.battleId, { chats: battle.chats });
  },
});