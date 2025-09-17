import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// -------------------- FILES --------------------

// Move file to trash
export const moveToTrash = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file) throw new Error("File not found");

    await ctx.db.patch(fileId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    return fileId;
  },
});

// Restore file from trash
export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file || !file.isDeleted) throw new Error("File not in trash");

    let folderId = file.folderId || null;
    if (folderId) {
      const folderExists = await ctx.db.get(folderId);
      if (!folderExists) {
        folderId = null;
      }
    }

    const existing = await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", folderId || undefined))
      .collect();

    let newName = file.name;
    if (existing.some((f) => f.name === file.name && !f.isDeleted)) {
      newName = `${file.name} (restored)`;
    }

    await ctx.db.patch(fileId, {
      isDeleted: false,
      deletedAt: undefined,
      folderId,
      name: newName,
    });

    return fileId;
  },
});

// Delete old files from trash
export const purgeOldTrash = mutation({
  args: {},
  handler: async (ctx) => {
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    const now = Date.now();

    const trashed = await ctx.db
      .query("files")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", true))
      .collect();

    for (const file of trashed) {
      if (file.deletedAt && now - file.deletedAt > THIRTY_DAYS) {
        await ctx.db.delete(file._id);
      }
    }

    return "Old trashed files removed";
  },
});

// Get all trashed files
export const getTrash = query({
  args: { orgId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", true))
      .collect();
  },
});

// -------------------- FOLDERS --------------------

// Move folder to trash (and all files inside)
export const moveFolderToTrash = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const folder = await ctx.db.get(folderId);
    if (!folder) throw new Error("Folder not found");

    await ctx.db.patch(folderId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    const files = await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", folderId))
      .collect();

    for (const file of files) {
      await ctx.db.patch(file._id, {
        isDeleted: true,
        deletedAt: Date.now(),
      });
    }

    return folderId;
  },
});

// Restore folder from trash (and all files inside)
export const restoreFolder = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const folder = await ctx.db.get(folderId);
    if (!folder || !folder.isDeleted) throw new Error("Folder not in trash");

    const existing = await ctx.db
      .query("folders")
      .withIndex("by_orgId_name", (q) =>
        q.eq("orgId", folder.orgId).eq("name", folder.name)
      )
      .unique();

    let newName = folder.name;
    if (existing && existing._id !== folderId) {
      newName = `${folder.name} (restored)`;
    }

    await ctx.db.patch(folderId, {
      isDeleted: false,
      deletedAt: undefined,
      name: newName,
    });

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

    return folderId;
  },
});

// Permanently delete folder and files inside
export const deleteFolderForever = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const folder = await ctx.db.get(folderId);
    if (!folder) throw new Error("Folder not found");

    const files = await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", folderId))
      .collect();

    for (const file of files) {
      await ctx.db.delete(file._id);
    }

    await ctx.db.delete(folderId);

    return folderId;
  },
});

// Get all trashed folders
export const getTrashedFolders = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", true))
      .filter((q) => q.eq(q.field("orgId"), orgId))
      .collect();
  },
});
