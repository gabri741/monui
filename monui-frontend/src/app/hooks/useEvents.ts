

import { useEffect, useState } from "react";
import { getEventMetrics, getEvents } from "../services/events/event.api";

export function useEventMetrics(userId: string) {
  const [metrics, setData] = useState<any>();
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    getEventMetrics(userId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [userId]);

  return { metrics, loading };
}

export function useEvents(
  page: number,
  limit: number,
  search: string,
  userId = "e3e1f37b-45b3-4a1f-93a7-89d21ce52a77"
) {
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getEvents(userId, page, limit, search)
      .then((res) => {
        setData(res.data);
        setTotalPages(Math.ceil(res.total / limit));
      })
      .catch((err) => {
        console.error("Erro no useEvents:", err);
        setData([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [page, limit, search, userId]);

  return { data, totalPages, loading };
}