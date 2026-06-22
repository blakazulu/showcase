"use client";
import {
  Timer,
  House,
  ChatCircleDots,
  Calculator,
  Siren,
  GraduationCap,
  Palette,
  Cube,
  Flask,
  Stethoscope,
  Keyboard,
  AirplaneTilt,
  ImageSquare,
  ShieldSlash,
  Bank,
  Cactus,
  MagnifyingGlass,
  FilePdf,
  type Icon,
} from "@phosphor-icons/react";

/* Curated Phosphor (MIT) icon per project, rendered in the duotone weight so
   each glyph reads as a two-tone mark in the category color (the secondary
   layer is currentColor at reduced opacity). */
const ICONS: Record<string, Icon> = {
  cycle: Timer,
  "new-home-owner": House,
  chathop: ChatCircleDots,
  "math-practice": Calculator,
  "az-ma-kore": Siren,
  "lumi-kid": GraduationCap,
  "past-palette": Palette,
  "save-the-past": Cube,
  "stem-explorers": Flask,
  archeotriage: Stethoscope,
  keyquest: Keyboard,
  floatjet: AirplaneTilt,
  "ai-image-generator": ImageSquare,
  "hotjar-blocker": ShieldSlash,
  mortgagefix: Bank,
  "kiryat-begin-desert-science": Cactus,
  "search-mcp": MagnifyingGlass,
  scalpelpdf: FilePdf,
};

export default function ProjectIcon({
  slug,
  size = 22,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  const Glyph = ICONS[slug] ?? Cube;
  return <Glyph size={size} weight="duotone" className={className} aria-hidden="true" />;
}
