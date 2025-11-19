export interface EventMetrics {
  eventsCreatedThisYear: number;
  nextEvent: { title: string; datetime: string } | null;
  futureEventsThisYear: number;
  lastCreatedEvent: { title: string; createdAt: string } | null;
}