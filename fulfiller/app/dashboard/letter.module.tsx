"use client"
import type { Letter } from "@/fulfiller";
import { Config } from "@/utils/config";
import { faCheck, faFlag, faUndo, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import * as z from "zod";

export default function LetterUI() {
  const [letter, setLetter] = useState<Letter | undefined>();
  const [config, setConfig] = useState<z.output<typeof Config> | undefined>();
  const [lastLetter, setLastLetter] = useState<Letter | undefined>();
  const [displayMsg, setDisplayMsg] = useState<"fulfilled" | "flagged" | "undone" | undefined>();
  async function nextLetter() {
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
  async function handleFulfill() {
    try {
      const res = await fetch(`/api/letter/${letter!.recordID}`, { method: "PATCH", body: JSON.stringify({ fulfilled: true }) });
      const body = await res.json();
      if (body.error) {
        alert(`There was an error updating the letter: ${body.message} (${body.error})`);
        return;
      }
    } catch (e) {
      console.error(`Error updating the letter!\n${e}`);
      alert("There was an error updating the letter, please check your console for more info.");
      return;
    }
    setLastLetter(letter);
    await nextLetter();
    setDisplayMsg("fulfilled");
    setTimeout(() => { setDisplayMsg(undefined) }, 3000);
  }
  async function handleFlag() {
    try {
      const res = await fetch(`/api/letter/${letter!.recordID}`, { method: "PATCH", body: JSON.stringify({ status: "Flagged" }) });
      const body = await res.json();
      if (body.error) {
        alert(`There was an error updating the letter: ${body.message} (${body.error})`);
        return;
      }
    } catch (e) {
      console.error(`Error updating the letter!\n${e}`);
      alert("There was an error updating the letter, please check your console for more info.");
      return;
    }
    setLastLetter(letter);
    await nextLetter();
    setDisplayMsg("flagged");
    setTimeout(() => { setDisplayMsg(undefined) }, 3000);
  }
  async function undoLast() {
    try {
      const res = await fetch(`/api/letter/${lastLetter!.recordID}`, { method: "PATCH", body: JSON.stringify({ status: lastLetter!.approval, fulfilled: false }) });
      const body = await res.json();
      if (body.error) {
        alert(`There was an error updating the letter: ${body.message} (${body.error})`);
        return;
      }
      setLetter(body);
    } catch (e) {
      console.error(`Error updating the letter!\n${e}`);
      alert("There was an error updating the letter, please check your console for more info.");
      return;
    }
    setLetter(lastLetter);
    setLastLetter(undefined);
    setDisplayMsg("undone");
    setTimeout(() => { setDisplayMsg(undefined) }, 3000);
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
  const handlers = useSwipeable({ onSwipedRight: async () => await handleFulfill(), onSwipedLeft: async () => await handleFlag(), trackTouch: true, trackMouse: true });
  if (!letter || !config) return <div>Loading letters...</div>
  return (
    <div className="gap-2">
      <div className={`${displayMsg ? "py-4" : "py-7"} mx-2 rounded-xl text-center ${displayMsg === "fulfilled" ? "bg-emerald-400" : ""} ${displayMsg === "flagged" ? "bg-orange-400" : ""} ${displayMsg === "undone" ? "bg-slate-400" : ""}`}>
        {displayMsg === "fulfilled" && <p><FontAwesomeIcon icon={faCheck} /> Fulfilled!</p>}
        {displayMsg === "flagged" && <p><FontAwesomeIcon icon={faFlag} /> Flagged for manual review!</p>}
        {displayMsg === "undone" && <p><FontAwesomeIcon icon={faUndo} /> Undid the last letter!</p>}
      </div>
      <div className="flex gap-2 justify-between bg-violet-300/70 p-2 mx-2 my-4 rounded-xl">
        <button onClick={async () => await undoLast()} disabled={lastLetter === undefined} className={`${lastLetter !== undefined ? "hover:text-sky-500" : "text-slate-400"}`}><FontAwesomeIcon icon={faUndo} /> undo last</button>
        {letter.approval === "Confirmed" ? <p className="text-emerald-500"><FontAwesomeIcon icon={faCheck} /> Confirmed</p> : <p className="text-orange-500"><FontAwesomeIcon icon={faWarning} /> {letter.approval}</p>}
      </div>
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
        <div className="absolute top-4 right-4 w-16 h-12 md:w-24 md:h-18 bg-violet-300 rounded-xs" />
      </div>
      <p className="absolute mt-30 text-sm text-slate-400">Record ID: {letter.recordID}</p>
    </div>
  );
}