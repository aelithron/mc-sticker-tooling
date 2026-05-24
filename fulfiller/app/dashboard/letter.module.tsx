"use client"
import type { Letter } from "@/fulfiller";
import { useEffect, useState } from "react";
import { SwipeEventData, useSwipeable } from "react-swipeable";

export default function LetterUI() {
  const [letter, setLetter] = useState<Letter | undefined>();
  async function handleFulfill(e: SwipeEventData) {
    
  }
  async function handleFlag(e: SwipeEventData) {
    
  }
  useEffect(() => {
    async function loadLetter() {
      try {
        const res = await fetch("/api/letter");
        const body = await res.json();
        setLetter(body);
      } catch (e) {
        console.error(`Error loading a letter!\n${e}`);
        alert("There was an error loading a letter, please check your console for more info.");
      }
    }
    loadLetter();
  }, []);
  const handlers = useSwipeable({ onSwipedRight: async (e) => await handleFulfill(e), onSwipedLeft: async (e) => await handleFlag(e) });
  if (!letter) return <div>Loading letters...</div>
  return (
    <div {...handlers} className="touch-pan-y bg-slate-100 p-8 shadow-2xl w-80 h-48 md:w-160 md:h-96 relative overflow-hidden">
      <div className="absolute top-4 left-4 text-sm md:text-lg">
        <p>Nova Harrington</p>
        <p>address 1</p>
        <p>address 2</p>
        {letter.address.country !== "United States of America (US)" && <p>United States of America</p>}
      </div>
      <div className="absolute top-1/2 left-1/3 m-auto text-sm md:text-lg">
        <p>{letter.address.name}</p>
        <p>{letter.address.street}</p>
        <p>{letter.address.city}, {letter.address.state} {letter.address.zip}</p>
        {letter.address.country !== "United States of America (US)" && <p>{letter.address.country.split("(")[0]}</p>}
      </div>
      <div className="absolute top-4 right-4 w-12 h-16 bg-violet-300" />
    </div>
  );
}