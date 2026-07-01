export type GuestStatus = 'pendente' | 'confirmado' | 'recusado';
export type EventCoverIcon =
  | 'sparkles'
  | 'heart'
  | 'calendarHeart'
  | 'cake'
  | 'church'
  | 'baby'
  | 'graduationCap'
  | 'building2'
  | 'briefcaseBusiness';

export interface EventItem {
  id: string;
  name: string;
  date: string; // ISO date (yyyy-mm-dd)
  time: string; // HH:mm
  location: string;
  description: string;
  welcomeMessage: string;
  maxGuestsTotal?: number; // optional overall cap for the event
  coverIcon?: EventCoverIcon;
  createdAt: string;
}

export interface Guest {
  id: string;
  eventId: string;
  responsibleName: string;
  phone: string;
  expectedPeople: number;
  confirmedPeople: number;
  status: GuestStatus;
  respondedAt?: string;
  createdAt: string;
  slug: string; // unique token used in the public link
}

export interface EventMetrics {
  totalInvites: number;
  totalExpectedPeople: number;
  totalConfirmations: number;
  totalConfirmedPeople: number;
  totalDeclined: number;
  totalPending: number;
  confirmationRate: number; // 0-100
}

export interface AdminUser {
  name: string;
  email: string;
  createdAt: string;
  photoUrl?: string;
  plan?: {
    name: string;
    status: 'Ativo' | 'Pausado' | 'Expirado';
    renewAt?: string;
  };
}

export interface AccountFormValues {
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
}
