import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const chatSchema = defineTable({
  name: v.string(),
  messages: v.array(v.any()),
  updatedAt: v.number(),
  messageCount: v.optional(v.number()), // Cache for performance
  parentChatId: v.optional(v.id("chats")), // Reference to the original chat if this is a branch
  branchFromIndex: v.optional(v.number()), // Index of the message this branch started from
  isFavorite: v.optional(v.boolean()),
  isArchived: v.optional(v.boolean()),
  activeStreamId: v.optional(v.string()),
  model: v.optional(v.object({
    id: v.string(),
    name: v.string(),
    provider: v.string(),
    region: v.optional(v.string()),
    inputCostPerToken: v.optional(v.number()),
    outputCostPerToken: v.optional(v.number()),
    capabilities: v.optional(v.array(v.string())),
  })),
  systemPrompt: v.optional(v.string()),
  maxTokens: v.optional(v.number()),
  temperature: v.optional(v.number()),
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