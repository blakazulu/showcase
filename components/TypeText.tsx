"use client";
import { useEffect, useState } from "react";

/* Types `text` out character-by-character on mount. Renders the full string
   immediately when reduced-motion is on (or matchMedia is unavailable). */
export default function TypeText({
  text,
  speed = 45,
  startDelay = 350,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setN(text.length);
      return;
    }

    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const start = setTimeout(function step() {
      i += 1;
      setN(i);
      if (i < text.length) timer = setTimeout(step, speed);
    }, startDelay);

    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [text, speed, startDelay]);

  return <>{text.slice(0, n)}</>;
}
