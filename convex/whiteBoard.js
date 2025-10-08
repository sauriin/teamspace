import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getUser } from "./users";

// Helper: check if user has access to an org
async function hasAccessToOrg(ctx, tokenIdentifier, orgId) {
  const user = await getUser(ctx, tokenIdentifier);
  if (!user) return false;
  return user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
}

// Queries

// Get all strokes for a board (with access check)
export const getStrokes = query({
  args: { boardId: v.string(), orgId: v.string() },
  handler: async (ctx, { boardId, orgId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      orgId
    );
    if (!hasAccess)
      throw new ConvexError("You don't have access to this board.");

    return await ctx.db
      .query("strokes")
      .withIndex("by_board_org", (q) =>
        q.eq("boardId", boardId).eq("orgId", orgId)
      )
      .order("asc")
      .collect();
  },
});

// Add a stroke
export const addStroke = mutation({
  args: {
    boardId: v.string(),
    orgId: v.string(),
    stroke: v.object({
      userId: v.string(),
      tool: v.string(),
      color: v.string(),
      width: v.number(),
      points: v.array(v.object({ x: v.number(), y: v.number() })),
      createdAt: v.number(),
    }),
  },
  handler: async (ctx, { boardId, orgId, stroke }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      orgId
    );
    if (!hasAccess)
      throw new ConvexError("You don't have access to this board.");

    await ctx.db.insert("strokes", {
      boardId,
      orgId, // ✅ added orgId here
      ...stroke,
    });

    return true;
  },
});

// Clear all strokes
export const clearBoard = mutation({
  args: { boardId: v.string(), orgId: v.string() },
  handler: async (ctx, { boardId, orgId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      orgId
    );
    if (!hasAccess)
      throw new ConvexError("You don't have access to this board.");

    const strokes = await ctx.db
      .query("strokes")
      .withIndex("by_board_org", (q) =>
        q.eq("boardId", boardId).eq("orgId", orgId)
      )
      .collect();

    for (const s of strokes) {
      await ctx.db.delete(s._id);
    }

    return true;
  },
});

// Remove the last stroke (Undo)
export const removeLastStroke = mutation({
  args: { boardId: v.string(), orgId: v.string() },
  handler: async (ctx, { boardId, orgId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      orgId
    );
    if (!hasAccess)
      throw new ConvexError("You don't have access to this board.");

    // Get the latest stroke for this board & org
    const strokes = await ctx.db
      .query("strokes")
      .withIndex("by_board_org", (q) =>
        q.eq("boardId", boardId).eq("orgId", orgId)
      )
      .order("desc") // newest first
      .take(1);

    if (strokes.length > 0) {
      await ctx.db.delete(strokes[0]._id);
    }

    return true;
  },
});
