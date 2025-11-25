export interface EventMetrics {
  eventsCreatedThisYear: number;
  nextEvent: { title: string; datetime: string } | null;
  futureEventsThisYear: number;
  lastCreatedEvent: { title: string; createdAt: string } | null;
}

// services/events/events.api.ts
export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  datetime: string; // ISO
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  createdBy: string;
}

export interface PaginatedEvents {
  data: EventItem[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  datetime: string;
  createdBy: string;
}