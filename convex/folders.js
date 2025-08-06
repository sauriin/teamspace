// convex/folders.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";

// Mutation: Create a folder
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
      user.orgIds.includes(args.orgId) ||
      user.tokenIdentifier.includes(args.orgId);

    if (!hasAccess) throw new Error("Unauthorized");

    // Prevent duplicate folder creation
    const existing = await ctx.db
      .query("folders")
      .withIndex("by_orgId_name", (q) =>
        q.eq("orgId", args.orgId).eq("name", args.name)
      )
      .unique();

    if (existing) return; // Folder already exists

    await ctx.db.insert("folders", {
      name: args.name,
      orgId: args.orgId,
      createdAt: Date.now(),
      createdBy: identity.subject,
    });
  },
});

// Query: Get all folders for an organization
export const getFolders = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await getUser(ctx, identity.tokenIdentifier);
    const hasAccess =
      user.orgIds.includes(args.orgId) ||
      user.tokenIdentifier.includes(args.orgId);

    if (!hasAccess) return [];

    return ctx.db
      .query("folders")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
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

    // Prevent renaming to a name that already exists in the same org
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

// Delete Folder (only if empty)
export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, { folderId }) => {
    //Get all files in this folder
    const files = await ctx.db
      .query("files")
      .withIndex("by_folderId", (q) => q.eq("folderId", folderId))
      .collect();

    //Delete each file in the folder
    for (const file of files) {
      await ctx.db.delete(file._id);
    }

    //Delete the folder itself
    await ctx.db.delete(folderId);
  },
});
