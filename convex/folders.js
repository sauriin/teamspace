// convex/folders.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";

/* 
// Create Folder (kept commented as requested)
export const createFolder = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getUser(ctx, identity.tokenIdentifier);
    const hasAccess =
      user?.orgIds?.includes(args.orgId) ||
      user?.tokenIdentifier?.includes(args.orgId);

    if (!hasAccess) throw new Error("Unauthorized");

    // Prevent duplicate folder creation
    const existing = await ctx.db
      .query("folders")
      .withIndex("by_orgId_name", (q) =>
        q.eq("orgId", args.orgId).eq("name", args.name)
      )
      .unique();

    if (existing) return;

    await ctx.db.insert("folders", {
      name: args.name,
      orgId: args.orgId,
      createdAt: Date.now(),
      createdBy: identity.subject,          // Clerk user ID
      createdByName: identity.name || "Unknown", // Clerk display name
      isDeleted: false,
    });
  },
});
*/

// Query: Get all folders for an organization (excluding trashed)
export const getFolders = query({
  args: v.object({
    orgId: v.string(),
    searchQuery: v.optional(v.string()),
  }),
  async handler(ctx, { orgId, searchQuery }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await getUser(ctx, identity.tokenIdentifier);
    const hasAccess =
      user?.orgIds?.includes(orgId) || user?.tokenIdentifier?.includes(orgId);

    if (!hasAccess) return [];

    // Fetch all folders for the org
    let folders = await ctx.db
      .query("folders")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();

    // 🔹 Exclude trashed folders
    folders = folders.filter((f) => !f.isDeleted);

    // Apply search query if provided
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      folders = folders.filter((f) =>
        f.name.toLowerCase().includes(lowerQuery)
      );
    }

    // Map output
    return folders.map((f) => ({
      ...f,
      createdByName: f.createdByName || "Unknown",
      createdAt: f.createdAt,
    }));
  },
});

// Query: Get single folder details
export const getFolderDetails = query({
  args: { folderId: v.id("folders") },
  async handler(ctx, { folderId }) {
    const folder = await ctx.db.get(folderId);
    if (!folder) throw new Error("Folder not found");

    return {
      name: folder.name,
      createdAt: folder.createdAt,
      createdByName: folder.createdByName || "Unknown",
      isDeleted: folder.isDeleted || false,
    };
  },
});

// Rename Folder
export const renameFolder = mutation({
  args: {
    folderId: v.id("folders"),
    newName: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found");

    const existing = await ctx.db
      .query("folders")
      .withIndex("by_orgId_name", (q) =>
        q.eq("orgId", folder.orgId).eq("name", args.newName)
      )
      .unique();

    if (existing && existing._id !== args.folderId) {
      throw new Error("A folder with that name already exists.");
    }

    await ctx.db.patch(args.folderId, {
      name: args.newName,
    });
  },
});

// Delete Folder (and all files inside it)
export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  async handler(ctx, { folderId }) {
    // Get all files in this folder
    const files = await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", folderId))
      .collect();

    // Delete each file
    for (const file of files) {
      await ctx.db.delete(file._id);
    }

    // Delete the folder itself
    await ctx.db.delete(folderId);
  },
});

export const getFilesInFolder = query({
  args: { folderId: v.optional(v.id("folders")) },
  async handler(ctx, { folderId }) {
    if (!folderId) return []; // safe guard

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Fetch all files by folderId
    const files = await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", folderId))
      .collect();

    // Only non-deleted files
    return files.filter((f) => !f.isDeleted);
  },
});
