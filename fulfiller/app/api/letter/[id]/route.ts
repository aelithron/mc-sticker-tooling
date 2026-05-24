import { updateStatus } from "@/utils/airtable";
import { auth } from "@/utils/auth";
import loadConfig from "@/utils/config";
import { NextRequest, NextResponse } from "next/server";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "unauthorized", message: "You aren't signed in, please sign in to continue!" }, { status: 401 });
  const config = await loadConfig();
  if (!session.user.emailVerified || !config.approvedUsers.includes(session.user.email)) return NextResponse.json({ error: "forbidden", message: "You don't have permission to use this, please ask an admin to add you!" }, { status: 403 });
  const body = await req.json();
  if (body.status && body.status !== "Approved" && body.status !== "Confirmed" && body.status !== "Flagged") return NextResponse.json({ error: "status", message: "Your status field isn't approved, confirmed, or flagged!" }, { status: 400 });
  if (body.fulfilled !== undefined && body.fulfilled !== true && body.fulfilled !== false) return NextResponse.json({ error: "fulfilled", message: "Your fulfilled field isn't true or false!" }, { status: 400 });
  if (!body.status && !body.fulfilled) return NextResponse.json({ success: true, message: "Nothing to update!" });
  const update = await updateStatus((await params).id, { status: body.status, fulfilled: body.fulfilled });
  if (!update) return NextResponse.json({ error: "server", message: "Error updating the record!" }, { status: 500 });
  return NextResponse.json({ success: true });
}