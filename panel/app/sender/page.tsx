import Link from "next/link";
import LetterUI from "./letter.module";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Sender" }
export default function Page() {
  return (
    <div className="flex flex-col min-h-screen p-8 md:px-20">
      <Link href={"/"} className="bg-violet-300 p-1 rounded-xl w-min hover:text-sky-500"><FontAwesomeIcon icon={faArrowLeft} /></Link>
      <LetterUI />
    </div>
  );
}