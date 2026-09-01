import loadTable from "@/utils/airtable";
import { auth } from "@/utils/auth";
import loadConfig from "@/utils/config";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "unauthorized", message: "You aren't signed in, please sign in to continue!" }, { status: 401 });
  const config = await loadConfig();

}