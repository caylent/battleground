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
  args: { userId: v.string(), chats: v.optional(v.array(modelSchema)) },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("battles", { userId: args.userId, chats: args.chats ?? [] });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: { id: v.id("battles"), chats: v.array(modelSchema) },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { chats: args.chats });
  },
});