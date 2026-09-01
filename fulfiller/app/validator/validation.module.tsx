"use client";

import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export function OverrideStatus({ id }: { id: string }) {
  const [approval, setApproval] = useState<string>("");
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (approval === "") {
      alert("Please select a status to override to first!");
      return;
    }
    try {
      const res = await fetch(`/api/letter/${id}`, { method: "PATCH", body: JSON.stringify({ approval }) });
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
    window.location.reload();
  }
  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <select value={approval} className="bg-violet-400 p-1 rounded-xl" onChange={(e) => setApproval(e.target.value)}>
        <option value={""}> -- Select -- </option>
        <option value={"Pending"}>Pending</option>
        <option value={"Flagged"}>Flagged</option>
        <option value={"Approved"}>Approved</option>
      </select>
      <button type="submit" className="bg-violet-400 p-1 rounded-xl"><FontAwesomeIcon icon={faCaretRight} /></button>
    </form>
  )
}