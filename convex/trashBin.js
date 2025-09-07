import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";

// shared access check
async function hasAccessToOrg(ctx, tokenIdentifier, orgId) {
  const user = await getUser(ctx, tokenIdentifier);
  return user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
}

// 🗑️Move file to Trash
export const moveToTrash = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new ConvexError("File not found");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    );
    if (!hasAccess) throw new ConvexError("Unauthorized");

    await ctx.db.patch(args.fileId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });
  },
});

// Restore file from Trash
export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const file = await ctx.db.get(args.fileId);
    if (!file || !file.isDeleted) throw new ConvexError("File not in trash");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    );
    if (!hasAccess) throw new ConvexError("Unauthorized");

    await ctx.db.patch(args.fileId, {
      isDeleted: false,
      deletedAt: undefined,
    });
  },
});

// Get all trashed files
export const getTrashedFiles = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );
    if (!hasAccess) return [];

    return await ctx.db
      .query("files")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", true))
      .filter((q) => q.eq(q.field("orgId"), args.orgId))
      .collect();
  },
});

//  Permanently delete a file
export const permanentlyDeleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const file = await ctx.db.get(args.fileId);
    if (!file || !file.isDeleted) throw new ConvexError("File not in trash");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    );
    if (!hasAccess) throw new ConvexError("Unauthorized");

    await ctx.db.delete(args.fileId);
    await ctx.storage.delete(file.fileId); // remove blob too
  },
});
