"use client"
import { authClient } from "@/utils/auth";

export default function AuthButton() {
  const session = authClient.useSession();
  if (!session.data) {
    return <button onClick={async () => await authClient.signIn.social({ provider: "hca" })} className="flex flex-col text-center bg-violet-300 p-2 rounded-lg hover:text-sky-500">Sign In</button>
  } else {
    return <button onClick={async () => await authClient.signOut()} className="flex flex-col text-center bg-red-300 p-2 rounded-lg hover:text-sky-500">Sign Out</button>
  }
}