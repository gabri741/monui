import { EventMetrics } from "./event.types";

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