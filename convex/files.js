import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createFile = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.insert("files", {
      name: args.name,
    });
  },
});
