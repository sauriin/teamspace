import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// File Types
export const fileTypes = v.union(
  v.literal("pdf"),
  v.literal("doc"),
  v.literal("docx"),
  v.literal("txt"),
  v.literal("image"),
  v.literal("csv"),
  v.literal("xls"),
  v.literal("xlsx"),
  v.literal("ppt"),
  v.literal("pptx")
);

export default defineSchema({
  // Files Table
  files: defineTable({
    name: v.string(),
    type: fileTypes,
    orgId: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    fileId: v.id("_storage"),
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    createdByName: v.string(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_isDeleted", ["isDeleted"])
    .index("by_orgId_createdAt", ["orgId", "createdAt"])
    .index("by_folderId", ["folderId"]),

  // Folders Table
  folders: defineTable({
    name: v.string(),
    orgId: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(),
    createdByName: v.string(),
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_name", ["orgId", "name"])
    .index("by_isDeleted", ["isDeleted"])
    .index("by_orgId_createdAt", ["orgId", "createdAt"]),

  // Users Table
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  // Starred Table
  starred: defineTable({
    userId: v.id("users"),
    orgId: v.string(),
    fileId: v.id("files"),
    createdAt: v.number(),
  })
    .index("by_user_org", ["userId", "orgId"])
    .index("by_user_org_file", ["userId", "orgId", "fileId"]),

  // Whiteboard Strokes Table
  strokes: defineTable({
    boardId: v.string(),
    orgId: v.string(), 
    userId: v.string(),
    tool: v.string(), // "pen", "eraser", "highlighter", "line", etc.
    color: v.string(),
    width: v.number(),
    points: v.array(v.object({ x: v.number(), y: v.number() })),
    createdAt: v.number(), // timestamp
  })
    .index("by_board", ["boardId"])
    .index("by_board_org", ["boardId", "orgId"]), 
});
