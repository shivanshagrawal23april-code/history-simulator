import {
  Compass,
  GitBranch,
  Crown,
  Users,
  Milestone,
  Globe2,
  Scale,
  Telescope,
  BookMarked,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// Maps a Mode.icon name to its lucide icon component.
export const MODE_ICONS: Record<string, LucideIcon> = {
  Compass,
  GitBranch,
  Crown,
  Users,
  Milestone,
  Globe2,
  Scale,
  Telescope,
  BookMarked,
  GraduationCap,
};

export function getModeIcon(name: string): LucideIcon {
  return MODE_ICONS[name] ?? Sparkles;
}
