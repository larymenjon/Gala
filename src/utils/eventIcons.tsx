import type { LucideIcon } from 'lucide-react';
import {
  Baby,
  BriefcaseBusiness,
  Cake,
  CalendarHeart,
  Church,
  GraduationCap,
  Heart,
  Sparkles,
  Building2,
} from 'lucide-react';
import type { EventCoverIcon } from '../types';

export const EVENT_ICON_OPTIONS: Array<{ value: EventCoverIcon; label: string; Icon: LucideIcon }> = [
  { value: 'sparkles', label: 'Destaque', Icon: Sparkles },
  { value: 'heart', label: 'Celebração', Icon: Heart },
  { value: 'calendarHeart', label: 'Convite', Icon: CalendarHeart },
  { value: 'cake', label: 'Aniversário', Icon: Cake },
  { value: 'church', label: 'Religioso', Icon: Church },
  { value: 'baby', label: 'Chá / Infantil', Icon: Baby },
  { value: 'graduationCap', label: 'Formatura', Icon: GraduationCap },
  { value: 'building2', label: 'Corporativo', Icon: Building2 },
  { value: 'briefcaseBusiness', label: 'Negócios', Icon: BriefcaseBusiness },
];

export function getEventIcon(value?: string): LucideIcon {
  return EVENT_ICON_OPTIONS.find((option) => option.value === value)?.Icon ?? Sparkles;
}
