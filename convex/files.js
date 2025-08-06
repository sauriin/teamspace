import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";
import { fileTypes } from "./schema";

// Generate Upload URL
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("You must be logged In to Upload File.");
  return await ctx.storage.generateUploadUrl();
});

// Check user/org access
async function hasAccessToOrg(ctx, tokenIdentifier, orgId) {
  const user = await getUser(ctx, tokenIdentifier);
  return user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
}

// Extract prefix/keyword from file name
function extractKeyword(fileName) {
  const base = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
  const keyword = base.split(/[_\s-]/)[0]; // Take first segment
  return keyword;
}

const clusteredTypes = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "csv",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
];

// Create File Mutation
export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      throw new ConvexError("You must be logged in to upload file.");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );
    if (!hasAccess)
      throw new ConvexError("You don't have access to this Organization.");

    let folderId = undefined;

    if (clusteredTypes.includes(args.type)) {
      const keyword = extractKeyword(args.name);

      let folder = await ctx.db
        .query("folders")
        .withIndex("by_orgId_name", (q) =>
          q.eq("orgId", args.orgId).eq("name", keyword)
        )
        .unique();

      if (!folder) {
        folderId = await ctx.db.insert("folders", {
          name: keyword,
          orgId: args.orgId,
          createdAt: Date.now(),
          createdBy: identity.subject,
        });
      } else {
        folderId = folder._id;
      }
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
      folderId, // optional folder reference
    });
  },
});

// Get Files
export const getFiles = query({
  args: {
    orgId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );
    if (!hasAccess) return [];

    return ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

// Delete File
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new ConvexError("This file does not exist");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    );
    if (!hasAccess) throw new ConvexError("Unauthorized");

    await ctx.db.delete(args.fileId);
  },
});

// Get File Download URL
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new ConvexError("Failed to retrieve download URL.");
    return url;
  },
});

export const getFilesByFolder = query({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .collect();
  },
});
