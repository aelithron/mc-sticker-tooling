import Link from "next/link";
import LetterUI from "./letter.module";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen p-8 md:px-20 items-center justify-center">
      <Link href={"/"} className="bg-slate-500"><FontAwesomeIcon icon={faArrowLeft} /></Link>
      <LetterUI />
    </div>
  );
}