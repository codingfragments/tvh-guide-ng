import {
  Tv as TvIcon,
  CalendarDays as CalendarDaysIcon,
  List as ListIcon,
  CircleDot as CircleDotIcon,
  Settings as SettingsIcon,
} from 'lucide-svelte';

type IconComponent = typeof TvIcon;

export interface NavItem {
  href: string;
  label: string;
  icon: IconComponent;
}

export const mainNavItems: NavItem[] = [
  { href: '/now', label: 'Now', icon: TvIcon },
  { href: '/guide', label: 'Guide', icon: CalendarDaysIcon },
  { href: '/channels', label: 'Channels', icon: ListIcon },
  { href: '/recordings', label: 'Recordings', icon: CircleDotIcon },
];

export const utilityNavItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
