import loadTable from "@/utils/airtable";
import { auth } from "@/utils/auth";
import loadConfig from "@/utils/config";
import { faArrowLeft, faCheck, faClock, faDatabase, faEnvelope, faFlag, faHome, faMessage, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { OverrideStatus, ValidateLetters } from "./validation.module";
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
      <Link href={"/"} className="bg-violet-300 p-1 rounded-xl w-min hover:text-sky-500"><FontAwesomeIcon icon={faArrowLeft} /></Link>
      <h1 className="font-semibold text-3xl"><FontAwesomeIcon icon={faCheck} /> Validator</h1>
      <div className="flex gap-2">
        {!config.runningValidation ? <ValidateLetters /> : <p className="bg-violet-300 text-violet-500 py-1 px-2 gap-1 rounded-xl flex items-center w-fit"><FontAwesomeIcon icon={faRefresh} /> Validation running...</p>}
        <a href={`https://airtable.com/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`} target="_blank" className="bg-violet-400 py-1 px-2 rounded-xl flex w-fit items-center gap-1 hover:text-sky-500"><FontAwesomeIcon icon={faDatabase} /> Open Airtable</a>
      </div>
      <h1 className="text-2xl font-semibold mt-4"><FontAwesomeIcon icon={faEnvelope} /> Pending Requests</h1>
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

async function ValidatorCard({ letter }: { letter: Letter }) {
  const comments: { id: string, author: string, text: string, createdAt: Date }[] = [];
  try {
    const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}/${letter.recordID}/comments`, { headers: { "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}` } });
    const commentData = await res.json();
    if (!commentData.comments) console.error(`Failed to load comments: ${commentData.error.message} (${commentData.error.type})`);
    for (const comment of (commentData.comments || [])) comments.push({ id: comment.id as string, author: comment.author.name as string, text: comment.text as string, createdAt: new Date(comment.createdTime as string) });
  } catch (e) {
    console.error(`Failed to load comments: ${e}`);
  }
  return (
    <div key={letter.recordID} className="flex flex-col p-2 bg-violet-300 rounded-lg">
      <h2 className="font-semibold">{letter.mcName}</h2>
      <div className="grid grid-cols-2 grid-rows-1 gap-2 mt-2 text-sm">
        <a href={`https://hackclub.slack.com/team/${letter.slackID}`} target="_blank" className="bg-violet-400 p-2 rounded-xl hover:text-sky-500"><FontAwesomeIcon icon={faMessage} /> Message</a>
        <a href={`https://airtable.com/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}/${letter.recordID}?blocks=hide`} target="_blank" className="bg-violet-400 p-2 rounded-xl  hover:text-sky-500"><FontAwesomeIcon icon={faDatabase} /> Open in Airtable</a>    
      </div>
      <div className="flex gap-2 text-sm mt-3 items-center">
        <p>Override Status:</p>
        <OverrideStatus id={letter.recordID} />
      </div>
      <div className="flex flex-col mt-2 gap-2">
        <h1>Comments ({comments.length})</h1>
        {comments.sort((a, b) => { return (a.createdAt.getTime() - b.createdAt.getTime()); }).map((comment) => <div key={comment.id} className="flex flex-col gap-2 bg-violet-400/50 p-2 rounded-lg">
          <h2 className="flex gap-1 items-center">{comment.author} <p className="text-sm p-1 bg-violet-500/50 rounded-xl"><FontAwesomeIcon icon={faClock} /> {comment.createdAt.toLocaleString("en-us")}</p></h2>
          <p className="whitespace-pre-wrap">{comment.text}</p>
        </div>)}
        {comments.length < 1 && <p>There are no comments on this!</p>}
      </div>
    </div>
  );
}