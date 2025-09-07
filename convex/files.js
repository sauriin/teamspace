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

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
      isDeleted: false, // always set false on creation
      deletedAt: undefined, // cleanup timestamp
    });
  },
});

// Get Files
export const getFiles = query({
  args: {
    orgId: v.optional(v.string()),
    query: v.optional(v.string()),
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

    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .filter((q) =>
        q.or(
          q.eq(q.field("isDeleted"), false),
          q.eq(q.field("isDeleted"), undefined) // support legacy rows
        )
      )
      .collect();

    if (args.query) {
      const lowerQuery = args.query.toLowerCase();
      files = files.filter((file) =>
        file.name.toLowerCase().includes(lowerQuery)
      );
    }

    return files;
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
