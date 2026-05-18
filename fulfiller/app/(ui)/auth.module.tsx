"use client"
import { authClient } from "@/utils/auth";
import { faDashboard, faSignIn, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function AuthButton() {
  const session = authClient.useSession();
  if (!session.data) {
    return <button onClick={async () => await authClient.signIn.social({ provider: "hca", callbackURL: "/dashboard" })} className="bg-violet-300 p-2 mt-2 rounded-lg hover:text-sky-500"><FontAwesomeIcon icon={faSignIn} /> Sign In</button>
  } else {
    return (
      <div className="flex gap-2 mt-2 items-center text-center">
        <Link href="/dashboard" className="bg-violet-300 p-2 rounded-lg hover:text-sky-500"><FontAwesomeIcon icon={faDashboard} /> Dashboard</Link>
        <button onClick={async () => await authClient.signOut()} className="bg-red-300 p-2 rounded-lg hover:text-sky-500"><FontAwesomeIcon icon={faSignOut} /> Sign Out</button>
      </div> 
    );
  }
}