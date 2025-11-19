import { EventMetrics } from "./event.types";

export async function getEventMetrics(userId: string) {
  
  console.log("entrei")
  console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("URL chamada:", `${process.env.NEXT_PUBLIC_API_URL}/events/metrics/${userId}`);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events/metrics/${userId}`,
    { cache: "no-store" }
  );
 

  if (!res.ok) {
    throw new Error("Erro ao buscar métricas");
  }

  return res.json() as Promise<EventMetrics>;
}