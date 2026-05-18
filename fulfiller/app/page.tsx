import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthButton from "./(ui)/auth.module";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-8 md:py-10 md:px-20">
      <div className="flex flex-col items-center">
        <h1 className="font-semibold text-3xl"><FontAwesomeIcon icon={faStar} /> HC MC Sticker Fulfiller</h1>
        <p>Tool for sending out stickers for Hack Club MC! :3</p>
        <AuthButton />
      </div>
    </div>
  );
}
