import loadTable from "@/utils/airtable";
import { auth } from "@/utils/auth";
import loadConfig from "@/utils/config";
import { faCheck, faDatabase, faEnvelope, faFlag, faHome, faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { OverrideStatus } from "./validation.module";
import { Letter } from "@/fulfiller";

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
      <h1 className="font-semibold text-3xl mb-4"><FontAwesomeIcon icon={faCheck} /> Validator</h1>
      <h1 className="text-2xl font-semibold"><FontAwesomeIcon icon={faEnvelope} /> Pending Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {pending.map((letter) => <ValidatorCard letter={letter} key={letter.recordID} />)}
        {pending.length === 0 && <p className="flex text-center">There are no pending letters! :3</p>}
      </div>
      <h1 className="text-2xl font-semibold mt-3"><FontAwesomeIcon icon={faFlag} /> Flagged Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {flagged.map((letter) => <ValidatorCard letter={letter} key={letter.recordID} />)}
        {flagged.length === 0 && <p className="flex text-center">There are no flagged letters! :3</p>}
      </div>
    </main>
  );
}

function ValidatorCard({ letter, key }: { letter: Letter, key: string }) {
  return (
    <div key={key} className="flex flex-col p-2 bg-violet-300 rounded-lg">
      <h2 className="font-semibold">{letter.mcName}</h2>
      <div className="grid grid-cols-2 grid-rows-1 gap-2 mt-2 text-sm">
        <a href={`https://hackclub.slack.com/team/${letter.slackID}`} target="_blank" className="bg-violet-400 p-2 rounded-xl"><FontAwesomeIcon icon={faMessage} /> Message</a>
        <a href={`https://airtable.com/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}/${letter.recordID}?blocks=hide`} target="_blank" className="bg-violet-400 p-2 rounded-xl"><FontAwesomeIcon icon={faDatabase} /> Open Airtable</a>
      </div>
      <div className="flex gap-2 text-sm mt-3 items-center">
        <p>Override Status:</p>
        <OverrideStatus id={letter.recordID} />
      </div>
    </div>
  );
}