import { auth } from "@/utils/auth";
import loadConfig from "@/utils/config";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "unauthorized", message: "You aren't signed in, please sign in to continue!" }, { status: 401 });
  const config = await loadConfig();
  if (!session.user.emailVerified || !config.approvedUsers.includes(session.user.email)) return NextResponse.json({ error: "forbidden", message: "You don't have permission to use this, please ask an admin to add you!" }, { status: 403 });
  return NextResponse.json(config);
}
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "unauthorized", message: "You aren't signed in, please sign in to continue!" }, { status: 401 });
  // todo: more work on this
}