import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const chatSchema = defineTable({
  name: v.string(),
  messages: v.array(v.any()),
  status: v.union(v.literal("idle"), v.literal("in-progress")),
  updatedAt: v.number(),
  messageCount: v.optional(v.number()), // Cache for performance
  parentChatId: v.optional(v.id("chats")), // Reference to the original chat if this is a branch
  branchFromIndex: v.optional(v.number()), // Index of the message this branch started from
  isFavorite: v.optional(v.boolean()),
  isArchived: v.optional(v.boolean()),
});

export const promptSchema = defineTable({
  name: v.string(),
  prompt: v.string(),
  updatedAt: v.number(),
});

export default defineSchema({
  chats: chatSchema,
  prompts: promptSchema,
});