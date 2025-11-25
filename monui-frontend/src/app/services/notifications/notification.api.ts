import { NotificationChart, PaginatedRecipients } from "./notification.types";


const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function getNotificationChartData(userId: string , period : string) {

    userId = 'e3e1f37b-45b3-4a1f-93a7-89d21ce52a77'
    

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/notifications/stats/${userId}?period=${period}`,
    { cache: "no-store" }
  );
 

  if (!res.ok) {
    throw new Error("Erro ao buscar dados");
  }

  return res.json() as Promise<NotificationChart[]>;
}

export async function getRecipientsByUser(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications/recipients?userId=${userId}&page=${page}&limit=${limit}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Erro ao buscar recipients");
  }

  return res.json() as Promise<PaginatedRecipients>;
}


export async function createReminder(payload: any) {
  const res = await fetch(`${API_URL}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Erro ao criar reminder: ${res.status}`);
  }

  return res.json();
}

