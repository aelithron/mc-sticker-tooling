"use client"
import type { Letter } from "@/fulfiller";
import { Config } from "@/utils/config";
import { useEffect, useState } from "react";
import { SwipeEventData, useSwipeable } from "react-swipeable";
import * as z from "zod";

export default function LetterUI() {
  const [letter, setLetter] = useState<Letter | undefined>();
  const [config, setConfig] = useState<z.output<typeof Config> | undefined>();
  async function handleFulfill(e: SwipeEventData) {
    
  }
  async function handleFlag(e: SwipeEventData) {
    
  }
  useEffect(() => {
    async function loadLetter() {
      try {
        const configRes = await fetch("/api/config");
        const configBody = await configRes.json();
        if (configBody.error) {
          alert(`There was an error loading the config: ${configBody.message} (${configBody.error})`);
          return;
        }
        setConfig(configBody);
      } catch (e) {
        console.error(`Error loading the config:\n${e}`);
        alert("There was an error loading the config, please check your console for more info.");
        return;
      }
      try {
        const res = await fetch("/api/letter");
        const body = await res.json();
        if (body.error) {
          alert(`There was an error loading a letter: ${body.message} (${body.error})`);
          return;
        }
        setLetter(body);
      } catch (e) {
        console.error(`Error loading a letter!\n${e}`);
        alert("There was an error loading a letter, please check your console for more info.");
        return;
      }
    }
    loadLetter();
  }, []);
  const handlers = useSwipeable({ onSwipedRight: async (e) => await handleFulfill(e), onSwipedLeft: async (e) => await handleFlag(e) });
  if (!letter || !config) return <div>Loading letters...</div>
  return (
    <div {...handlers} className="touch-pan-y bg-slate-100 p-8 shadow-2xl w-80 h-48 md:w-160 md:h-96 relative overflow-hidden">
      <div className="absolute top-4 left-4 text-sm md:text-lg">
        <p>{config.returnAddress.name}</p>
        <p>{config.returnAddress.street}</p>
        <p>{config.returnAddress.city}, {config.returnAddress.state} {config.returnAddress.zip}</p>
        {letter.address.country !== "United States of America (US)" && <p>{config.returnAddress.country}</p>}
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