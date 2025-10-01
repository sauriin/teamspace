import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


// get all strokes
export const getStrokes = query({
  args: { boardId: v.string() },
  handler: async (ctx, { boardId }) => {
    return await ctx.db
      .query("strokes")
      .withIndex("by_board", (q) => q.eq("boardId", boardId))
      .order("asc")
      .collect();
  },
});

// Mutation: add a stroke
export const addStroke = mutation({
  args: {
    boardId: v.string(),
    stroke: v.object({
      userId: v.string(),
      tool: v.string(), // "pen", "eraser", etc.
      color: v.string(),
      width: v.number(),
      points: v.array(v.object({ x: v.number(), y: v.number() })),
      createdAt: v.number(),
    }),
  },
  handler: async (ctx, { boardId, stroke }) => {
    await ctx.db.insert("strokes", {
      boardId,
      ...stroke,
    });
    return true;
  },
});

// Mutation: clear board
export const clearBoard = mutation({
  args: { boardId: v.string() },
  handler: async (ctx, { boardId }) => {
    const strokes = await ctx.db
      .query("strokes")
      .withIndex("by_board", (q) => q.eq("boardId", boardId))
      .collect();

    for (const s of strokes) {
      await ctx.db.delete(s._id);
    }
    return true;
  },
});
