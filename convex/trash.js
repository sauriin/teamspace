import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Move file to Trash (soft delete).
 */
export const moveToTrash = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file) throw new Error("File not found.");

    await ctx.db.patch(fileId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    return fileId;
  },
});

/**
 * Restore a file from Trash.
 * - Restore to original folder if exists, otherwise root.
 * - Prevent duplicate file names.
 */
export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file || !file.isDeleted) throw new Error("File not in trash.");

    let folderId = file.folderId || null;
    if (folderId) {
      const folderExists = await ctx.db.get(folderId);
      if (!folderExists) {
        folderId = null; // fallback to root
      }
    }

    // Prevent name conflicts in the target folder
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

/**
 * Auto purge old files from Trash (e.g. older than 30 days).
 * Can be triggered manually or via scheduled cron.
 */
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

    return "Purge complete.";
  },
});

/**
 * Get all trashed files for org/user
 */
export const getTrash = query({
  args: { orgId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", true))
      .collect();
  },
});
