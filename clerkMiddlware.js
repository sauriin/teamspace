import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/"],

  afterAuth(auth, req) {
    // If user is signed in and still on root, send them to /docs
    if (auth.userId && req.nextUrl.pathname === "/") {
      const docsUrl = new URL("/docs", req.url);
      return NextResponse.redirect(docsUrl);
    }

    // If signed OUT and trying to go somewhere protected, force to /
    if (!auth.userId && req.nextUrl.pathname !== "/") {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // all routes except static files
    "/",
    "/(api|trpc)(.*)",
  ],
};
