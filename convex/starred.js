import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";

// access check helper
async function hasAccessToOrg(ctx, tokenIdentifier, orgId) {
  const user = await getUser(ctx, tokenIdentifier);
  if (!user) return false;

  if (!orgId) return true; // allow personal use if no org
  const orgIds = user.orgIds || [];

  return orgIds.includes(orgId);
}

// Add starred
export const addStarred = mutation({
  args: { fileId: v.id("files"), orgId: v.string() },
  async handler(ctx, { fileId, orgId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      orgId
    );
    if (!hasAccess) throw new ConvexError("Unauthorized");

    const user = await getUser(ctx, identity.tokenIdentifier);

    const file = await ctx.db.get(fileId);
    if (!file) throw new ConvexError("File does not exist");
    if (file.orgId !== orgId) throw new ConvexError("Wrong organization");

    // Prevent duplicate stars
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

//  Remove starred
export const removeStarred = mutation({
  args: { fileId: v.id("files"), orgId: v.string() },
  async handler(ctx, { fileId, orgId }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      orgId
    );
    if (!hasAccess) throw new ConvexError("Unauthorized");

    const user = await getUser(ctx, identity.tokenIdentifier);

    const starredRow = await ctx.db
      .query("starred")
      .withIndex("by_user_org_file", (q) =>
        q.eq("userId", user._id).eq("orgId", orgId).eq("fileId", fileId)
      )
      .unique();

    if (!starredRow) return;

    await ctx.db.delete(starredRow._id);
  },
});

//  Get all starred files (returns file docs)
export const getStarred = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
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

    const user = await getUser(ctx, identity.tokenIdentifier);

    // Fetch starred file references
    const rows = await ctx.db
      .query("starred")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", user._id).eq("orgId", orgId)
      )
      .collect();

    if (rows.length === 0) return [];

    // Load the actual file docs
    let files = await Promise.all(rows.map((r) => ctx.db.get(r.fileId)));
    files = files.filter(Boolean);

    // Optional search
    if (query && query.trim() !== "") {
      const qLower = query.toLowerCase();
      files = files.filter((file) => file.name.toLowerCase().includes(qLower));
    }

    return files;
  },
});
