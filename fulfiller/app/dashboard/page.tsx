import Letter from "./letter.module";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen p-8 md:px-20 items-center justify-center">
      <Letter />
    </div>
  );
}