"use client"
import { authClient } from "@/utils/auth";
import { faCheck, faEnvelope, faSignIn, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MainView() {
  const [authorized, setAuthorized] = useState<boolean>(true);
  const session = authClient.useSession();
  useEffect(() => {
    async function checkAuthorized() {
      try {
        const data = await fetch("/api/config");
        const json = await data.json();
        if (json.error) setAuthorized(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (ignored) {
        return;
      }
    }
    checkAuthorized();
    return () => { setAuthorized(true); }
  }, []);
  if (!session.data) {
    return <button onClick={async () => await authClient.signIn.social({ provider: "hca", callbackURL: "/" })} className="bg-violet-300 p-2 mt-2 rounded-lg hover:text-sky-500"><FontAwesomeIcon icon={faSignIn} /> Sign In</button>
  } else {
    if (!authorized) {
      return (
        <div className="flex flex-col gap-2 mt-2 items-center text-center">
          <h1>You don&apos;t have permission to use this tool, please ask an admin to add you or try with a different HCA account!</h1>
          <button onClick={async () => await authClient.signOut()} className="bg-red-300 p-2 rounded-lg hover:text-sky-500"><FontAwesomeIcon icon={faSignOut} /> Sign Out</button>
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-4 mt-2 items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href={"/validator"} className="flex flex-col bg-violet-300 p-2 rounded-lg">
            <h2 className="hover:text-sky-500 text-lg font-semibold"><FontAwesomeIcon icon={faCheck} /> <u>Validator</u></h2>
            <p>Shows pending requests that need to be checked first!</p>
          </Link>
          <Link href={"/sender"} className="flex flex-col bg-violet-300 p-2 rounded-lg">
            <h2 className="hover:text-sky-500 text-lg font-semibold"><FontAwesomeIcon icon={faEnvelope} /> <u>Sender</u></h2>
            <p>Shows envelopes ready to be sent out!</p>
          </Link>
        </div>
        <button onClick={async () => await authClient.signOut()} className="bg-red-300 p-2 rounded-lg hover:text-sky-500"><FontAwesomeIcon icon={faSignOut} /> Sign Out</button>
      </div> 
    );
  }
}