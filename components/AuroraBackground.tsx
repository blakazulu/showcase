"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import s from "./AuroraBackground.module.css";

const AuroraShader = dynamic(() => import("./AuroraShader"), { ssr: false });

/* Fixed, full-viewport aurora that backs the whole page. CSS blobs are the
   always-on base; the Three.js shader is layered over them as an accent and
   only mounts on capable, motion-OK devices. */
export default function AuroraBackground() {
  const [enhance, setEnhance] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowPower = small || (typeof mem === "number" && mem <= 4);
    setEnhance(!reduce && !lowPower);
  }, []);

  return (
    <div className={s.bg} aria-hidden="true">
      <div className={s.aurora}>
        <span className={`${s.blob} ${s.b1}`} />
        <span className={`${s.blob} ${s.b2}`} />
        <span className={`${s.blob} ${s.b3}`} />
        <span className={`${s.blob} ${s.b4}`} />
      </div>
      {enhance && (
        <div className={s.shader}>
          <AuroraShader />
        </div>
      )}
      <div className={s.grain} />
    </div>
  );
}
