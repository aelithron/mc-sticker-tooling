import { Letter } from "@/fulfiller";
import loadTable from "@/utils/airtable";
import { auth } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "unauthorized", message: "You aren't signed in, please sign in to continue!" }, { status: 401 });
  const queue = await loadTable();
  const confirmedQueue = queue.filter((letter) => (letter.approval === "Confirmed"));
  const unconfirmedQueue = queue.filter((letter) => (letter.approval === "Approved"));
  if (confirmedQueue.length >= 1) return NextResponse.json(confirmedQueue[0]);
  if (unconfirmedQueue.length >= 1) return NextResponse.json(unconfirmedQueue[0]);
  return NextResponse.json({ error: "empty", message: "The fulfillment queue is empty!" });
}