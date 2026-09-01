import loadTable from "@/utils/airtable";
import { auth } from "@/utils/auth";
import loadConfig from "@/utils/config";
import { faCheck, faEnvelope, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = { title: "Validator" }
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  const config = await loadConfig();
  if (!session || !session.user.emailVerified || (!config.approvedUsers.includes(session.user.email) && !config.approvedUsers.includes("*"))) {
    return (
      <div className="flex flex-col gap-2 mt-2 items-center text-center">
        <h1>You either aren&apos;t signed in, or don&apos;t have permission to use this tool.</h1>
        <h1>Please ask an admin to add you, or try with a different HCA account!</h1>
        <Link href={"/"}><FontAwesomeIcon icon={faHome} /> Go Home</Link>
      </div>
    );
  }
  const table = await loadTable("validator");
  const pending = table.filter((letter) => (letter.approval === "Pending")).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const flagged = table.filter((letter) => (letter.approval === "Flagged")).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return (
    <main className="flex flex-col min-h-screen p-8 md:p-20 gap-2">
      <h1 className="font-semibold text-3xl"><FontAwesomeIcon icon={faCheck} /> Validator</h1>
      <h1 className="text-2xl font-semibold"><FontAwesomeIcon icon={faEnvelope} /> Pending Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {pending.map((letter) => <div key={letter.recordID}>
          <h2></h2>
        </div>)}
      </div>
    </main>
  );
}