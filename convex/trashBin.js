import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";

// shared access check
async function hasAccessToOrg(ctx, tokenIdentifier, orgId) {
  const user = await getUser(ctx, tokenIdentifier);
  return user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
}

// Move file to Trash
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
  args: {
    orgId: v.string(),
    query: v.optional(v.string()), // 👈 allow optional search string
  },
  async handler(ctx, { orgId, query }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      orgId
    );
    if (!hasAccess) return [];

    let files = await ctx.db
      .query("files")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", true))
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .collect();

    // 🔍 Apply search filtering if query exists
    if (query && query.trim() !== "") {
      const qLower = query.toLowerCase();
      files = files.filter((file) => file.name.toLowerCase().includes(qLower));
    }

    return files;
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

// ============= FOLDERS TRASH QUERY =============

// Move folder to Trash
export const trashFolder = mutation({
  args: { folderId: v.id("folders") },
  async handler(ctx, { folderId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const folder = await ctx.db.get(folderId);
    if (!folder) throw new Error("Folder not found");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      folder.orgId
    );
    if (!hasAccess) throw new Error("Unauthorized");

    await ctx.db.patch(folderId, { isDeleted: true, deletedAt: Date.now() });
  },
});

//Get trashed Folder
export const getTrashedFolders = query({
  args: { orgId: v.string(), searchQuery: v.optional(v.string()) },
  async handler(ctx, { orgId, searchQuery }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      orgId
    );
    if (!hasAccess) return [];

    const trashed = await ctx.db
      .query("folders")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .filter((q) => q.eq(q.field("isDeleted"), true))
      .collect();

    // 🔍 Apply search if searchQuery is provided
    const filtered =
      searchQuery && searchQuery.trim()
        ? trashed.filter((f) =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : trashed;

    return filtered.map((f) => ({
      _id: f._id,
      name: f.name,
      orgId: f.orgId,
      createdByName: f.createdByName || "Unknown",
      createdAt: f.createdAt,
      isDeleted: true,
    }));
  },
});

// Restore folder and all files inside
export const restoreFolder = mutation({
  args: { folderId: v.id("folders") },
  async handler(ctx, { folderId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const folder = await ctx.db.get(folderId);
    if (!folder) throw new Error("Folder not found");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      folder.orgId
    );
    if (!hasAccess) throw new Error("Unauthorized");

    // ✅ Restore folder
    await ctx.db.patch(folderId, { isDeleted: false, deletedAt: undefined });

    // ✅ Restore files inside
    const files = await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", folderId))
      .collect();

    for (const file of files) {
      if (file.isDeleted) {
        await ctx.db.patch(file._id, {
          isDeleted: false,
          deletedAt: undefined,
        });
      }
    }
  },
});
