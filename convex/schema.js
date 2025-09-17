import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

  // folders table
  folders: defineTable({
    name: v.string(),
    orgId: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(), // Clerk user ID
    createdByName: v.string(), // Snapshot of Clerk display name
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_name", ["orgId", "name"])
    .index("by_isDeleted", ["isDeleted"])
    .index("by_orgId_createdAt", ["orgId", "createdAt"]),

  // users table (Clerk user mapping)
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  // starred table (single row per user+org+file)
  starred: defineTable({
    userId: v.id("users"),
    orgId: v.string(),
    fileId: v.id("files"),
    createdAt: v.float64(),
  })
    .index("by_user_org", ["userId", "orgId"])
    .index("by_user_org_file", ["userId", "orgId", "fileId"]),
});
