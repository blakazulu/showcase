"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import s from "./MagicRingsLayer.module.css";

const MagicRings = dynamic(() => import("./MagicRings"), { ssr: false });

/* Inner-page accent: Magic Rings layered over the site-wide aurora, tinted to
   the project's category color. Skipped on reduced-motion / low-power so we
   don't stack two WebGL contexts on weak devices. */
export default function MagicRingsLayer({ color }: { color: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowPower = small || (typeof mem === "number" && mem <= 4);
    setOn(!reduce && !lowPower);
  }, []);

  if (!on) return null;

  return (
    <div className={s.layer} aria-hidden="true">
      <MagicRings
        color={color}
        colorTwo="#4d7cff"
        ringCount={5}
        speed={0.9}
        opacity={0.55}
        baseRadius={0.42}
        ringGap={1.6}
        noiseAmount={0.06}
      />
    </div>
  );
}
