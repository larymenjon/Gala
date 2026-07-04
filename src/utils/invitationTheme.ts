import type { EventItem } from '../types';

export type InvitationStyle = NonNullable<EventItem['invitationStyle']>;

export type InvitationTheme = {
  label: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  mutedTextColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  borderColor: string;
};

export const INVITATION_STYLE_PRESETS: Record<InvitationStyle, InvitationTheme> = {
  editorial: {
    label: 'Editorial',
    primaryColor: '#0F1B33',
    secondaryColor: '#C89B3C',
    textColor: '#0F1B33',
    mutedTextColor: '#6B7280',
    backgroundColor: '#FBF8F4',
    cardBackgroundColor: '#FFFFFF',
    borderColor: '#F1EAE6',
  },
  modern: {
    label: 'Moderno',
    primaryColor: '#111827',
    secondaryColor: '#D9A7A2',
    textColor: '#111827',
    mutedTextColor: '#6B7280',
    backgroundColor: '#F8FAFC',
    cardBackgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  romantic: {
    label: 'Romântico',
    primaryColor: '#8C4E5D',
    secondaryColor: '#D9A7A2',
    textColor: '#3F2B32',
    mutedTextColor: '#7C6A70',
    backgroundColor: '#FFF7F6',
    cardBackgroundColor: '#FFFDFD',
    borderColor: '#F4DADA',
  },
  classic: {
    label: 'Clássico',
    primaryColor: '#162033',
    secondaryColor: '#B38A3C',
    textColor: '#162033',
    mutedTextColor: '#676B76',
    backgroundColor: '#FCFBF8',
    cardBackgroundColor: '#FFFFFF',
    borderColor: '#E9E3D8',
  },
};

export const INVITATION_STYLE_LABELS: Record<InvitationStyle, string> = {
  editorial: 'Editorial',
  modern: 'Moderno',
  romantic: 'Romântico',
  classic: 'Clássico',
};

export function getInvitationTheme(style?: EventItem['invitationStyle']) {
  return INVITATION_STYLE_PRESETS[style ?? 'editorial'];
}
