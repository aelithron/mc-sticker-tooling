"use client"
import { SwipeEventData, useSwipeable } from "react-swipeable";

export default function Letter() {
  async function handleFulfill(e: SwipeEventData) {
    
  }
  async function handleFlag(e: SwipeEventData) {
    
  }
  const handlers = useSwipeable({ onSwipedRight: async (e) => await handleFulfill(e), onSwipedLeft: async (e) => await handleFlag(e) });
  return (
    <div {...handlers} className="touch-pan-y bg-slate-100 p-8 shadow-2xl w-80 h-48 md:w-160 md:h-96 relative overflow-hidden">
      <div className="absolute top-4 left-4 text-sm md:text-lg">
        <p>Nova Harrington</p>
        <p>address 1</p>
        <p>address 2</p>
      </div>
      <div className="absolute top-1/2 left-1/3 m-auto text-sm md:text-lg">
        <p>person</p>
        <p>address 1</p>
        <p>address 2</p>
      </div>
      <div className="absolute top-4 right-4 w-12 h-16 bg-violet-300" />
    </div>
  );
}