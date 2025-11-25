import { EventItem, EventMetrics, PaginatedEvents } from "./event.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const userId = 'e3e1f37b-45b3-4a1f-93a7-89d21ce52a77'

export async function getEventMetrics(userId: string) {
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events/metrics/${userId}`,
    { cache: "no-store" }
  );
 

  if (!res.ok) {
    throw new Error("Erro ao buscar métricas");
  }

  return res.json() as Promise<EventMetrics>;
}

export async function getEvents(
  userId: string,
  page = 1,
  limit = 10,
  search = ""
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/events/paginated?userId=${userId}&page=${page}&limit=${limit}&search=${search}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Erro ao buscar eventos");
  }

  return res.json();
}

export async function createEvent(payload: any) {
  const res = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Erro ao criar evento: ${res.status}`);
  }

  return res.json();
}

export async function findGroupedCalendar(month: number, year: number) {
  const res = await fetch(`${API_URL}/events/grouped?month=${month + 1}&year=${year}&userId=${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar eventos calendar:  ${res.status}`);
  }

  return res.json();
}