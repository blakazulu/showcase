import {
  Timer,
  Home,
  MessageCircle,
  Calculator,
  Siren,
  GraduationCap,
  Palette,
  Box,
  FlaskConical,
  Stethoscope,
  Keyboard,
  Plane,
  ImagePlus,
  ShieldBan,
  Landmark,
  Sun,
  Search,
  FileText,
  type LucideIcon,
} from "lucide-react";

/* Curated Lucide (MIT) icon per project — replaces emoji glyphs with crisp,
   consistent SVGs that inherit the category color via currentColor. */
const ICONS: Record<string, LucideIcon> = {
  cycle: Timer,
  "new-home-owner": Home,
  chathop: MessageCircle,
  "math-practice": Calculator,
  "az-ma-kore": Siren,
  "lumi-kid": GraduationCap,
  "past-palette": Palette,
  "save-the-past": Box,
  "stem-explorers": FlaskConical,
  archeotriage: Stethoscope,
  keyquest: Keyboard,
  floatjet: Plane,
  "ai-image-generator": ImagePlus,
  "hotjar-blocker": ShieldBan,
  mortgagefix: Landmark,
  "kiryat-begin-desert-science": Sun,
  "search-mcp": Search,
  scalpelpdf: FileText,
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
  const Icon = ICONS[slug] ?? Box;
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}
