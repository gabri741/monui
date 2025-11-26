import { useEffect, useState } from "react";
import { getEventMetrics, getEvents } from "../services/events/event.api";

export function useEventMetrics(userId: string | null) {
  const [metrics, setData] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getEventMetrics(userId)
      .then(setData)
      .catch((error) => {
        console.error("Erro ao carregar métricas:", error);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { metrics, loading };
}

export function useEvents(
  page: number,
  limit: number,
  search: string,
  userId: string
) {
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

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
