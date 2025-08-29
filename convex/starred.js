import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";

// add starred
export const addStarred = mutation({
  args: { fileId: v.id("files"), orgId: v.string() },
  async handler(ctx, { fileId, orgId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized"); // must be logged in

    const user = await getUser(ctx, identity.tokenIdentifier); // map token to user doc
    if (!user.orgIds.includes(orgId)) throw new ConvexError("Unauthorized"); // must belong to org

    const file = await ctx.db.get(fileId);
    if (!file) throw new ConvexError("File does not exist"); // file must exist
    if (file.orgId !== orgId) throw new ConvexError("Wrong organization"); // file must be in org

    // prevent duplicate star
    const existing = await ctx.db
      .query("starred")
      .withIndex("by_user_org_file", (q) =>
        q.eq("userId", user._id).eq("orgId", orgId).eq("fileId", fileId)
      )
      .unique();
    if (existing) return;

    await ctx.db.insert("starred", {
      userId: user._id,
      orgId,
      fileId,
      createdAt: Date.now(),
    });
  },
});

// remove starred
export const removeStarred = mutation({
  args: { fileId: v.id("files"), orgId: v.string() },
  async handler(ctx, { fileId, orgId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized"); // must be logged in

    const user = await getUser(ctx, identity.tokenIdentifier); // map token to user doc

    const starredRow = await ctx.db
      .query("starred")
      .withIndex("by_user_org_file", (q) =>
        q.eq("userId", user._id).eq("orgId", orgId).eq("fileId", fileId)
      )
      .unique();
    if (!starredRow) return; // nothing to remove

    await ctx.db.delete(starredRow._id);
  },
});

// get all starred files (returns file docs)
export const getStarred = query({
  args: { orgId: v.string() },
  async handler(ctx, { orgId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return []; // no auth -> no data

    const user = await getUser(ctx, identity.tokenIdentifier); // map token to user doc
    if (!user.orgIds.includes(orgId)) return []; // must belong to org

    const rows = await ctx.db
      .query("starred")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("orgId", orgId)
      )
      .collect();

    if (rows.length === 0) return []; // no starred files

    const files = await Promise.all(rows.map((r) => ctx.db.get(r.fileId))); // load files
    return files.filter(Boolean); // filter deleted/missing files
  },
});
