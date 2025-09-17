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

// Create File Mutation with auto-folder logic
export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: v.optional(fileTypes),
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

    // Auto-detect file type if not given
    let fileType = args.type;
    if (!fileType) {
      const ext = args.name.split(".").pop()?.toLowerCase();
      switch (ext) {
        case "pdf":
        case "doc":
        case "docx":
        case "txt":
        case "csv":
        case "xls":
        case "xlsx":
        case "ppt":
        case "pptx":
          fileType = ext;
          break;
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
          fileType = "image";
          break;
        default:
          throw new ConvexError(`Unsupported file type: ${ext}`);
      }
    }

    let folderId; // leave undefined by default

    // Auto-create folder based on first keyword in name (skip images)
    if (fileType !== "image") {
      const keyword = args.name.split(/[_\-\s]/)[0].toLowerCase();

      let folder = await ctx.db
        .query("folders")
        .withIndex("by_orgId_name", (q) =>
          q.eq("orgId", args.orgId).eq("name", keyword)
        )
        .unique();

      if (!folder) {
        folderId = await ctx.db.insert("folders", {
          name: keyword, // ✅ use keyword, not full file name
          orgId: args.orgId,
          createdAt: Date.now(),
          createdBy: identity.subject, // Clerk user ID
          createdByName: identity.name || "Unknown", // Clerk display name snapshot
          isDeleted: false,
        });
      } else {
        folderId = folder._id;
      }
    }

    // Insert file into files table
    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: fileType,
      folderId, // undefined if no folder
      isDeleted: false,
      deletedAt: undefined,
      createdAt: Date.now(),
      createdByName: identity.name || "Unknown",
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
    //console.log(identity);

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
          q.eq(q.field("isDeleted"), undefined)
        )
      )
      .collect();

    files.sort((a, b) => b.createdAt - a.createdAt);

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
  args: { fileId: v.id("files") },
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
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new ConvexError("Failed to retrieve download URL.");
    return url;
  },
});

//Get File Detail
export const getFileDetails = query({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const file = await ctx.db.get(args.fileId);
    if (!file) return null;

    // get creator info
    let createdByName = "Unknown";
    if (file.createdBy) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier", (q) =>
          q.eq("tokenIdentifier", file.createdBy)
        )
        .unique();

      if (user) {
        createdByName = user.tokenIdentifier; // or map to display name if you store separately
      }
    }

    return {
      name: file.name,
      type: file.type,
      createdAt: file.createdAt,
      createdBy: createdByName,
    };
  },
});
