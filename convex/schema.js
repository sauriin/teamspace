import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(
  v.literal("pdf"),
  v.literal("doc"),
  v.literal("docx"),
  v.literal("txt"),
  v.literal("image"),

  // Spreadsheets
  v.literal("csv"),
  v.literal("xls"),
  v.literal("xlsx"),

  // Presentations
  v.literal("ppt"),
  v.literal("pptx")
);

export default defineSchema({
  files: defineTable({
    name: v.string(),
    type: fileTypes,
    orgId: v.optional(v.string()),
    fileId: v.id("_storage"),
    folderId: v.optional(v.id("folders")),
  })
    .index("by_orgId", ["orgId"])
    .index("by_folderId", ["folderId"]),

  folders: defineTable({
    name: v.string(), // Folder name like "DAA"
    orgId: v.optional(v.string()), // Same as files, to scope folders per org
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_name", ["orgId", "name"]), // <- Add this
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
