import {
  Award,
  BookMarked,
  Code2,
  FileText,
  LayoutDashboard,
  ListChecks,
  Map,
  NotebookPen,
  Settings,
  Sparkles,
  Swords,
  TrendingUp,
} from 'lucide-react';

export const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/today', label: "Today's Plan", icon: ListChecks },
  { to: '/practice', label: 'Practice', icon: Code2 },
  { to: '/problems', label: 'Problems', icon: FileText },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/patterns', label: 'Patterns', icon: Sparkles },
  { to: '/contests', label: 'Contests', icon: Swords },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/resources', label: 'Resources', icon: BookMarked },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/settings', label: 'Settings', icon: Settings },
];
