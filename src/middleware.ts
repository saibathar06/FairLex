import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

type Claims = {
  role?: string;
  publicMetadata?: {
    role?: string;
  };
  metadata?: {
    role?: string;
  };
  custom?: {
    role?: string;
  };
  [key: string]: unknown;
};

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  // Cast safely so TS stops complaining
  const claims = (sessionClaims || {}) as Claims;

  console.log("SESSION CLAIMS:", claims);

  if (isProtectedRoute(req)) {
    await auth.protect();

    const role =
      claims.role ||
      claims.publicMetadata?.role ||
      claims.metadata?.role ||
      claims.custom?.role;

    console.log("ROLE FOUND:", role);

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
