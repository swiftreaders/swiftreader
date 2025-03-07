// Updated route.ts
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getSession();
    return NextResponse.json({ session });
  } catch (error) {
    console.error("Auth session error:", error);
    return NextResponse.json({ session: null });
  }
}
