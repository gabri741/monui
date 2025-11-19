

import { useEffect, useState } from "react";
import { getEventMetrics } from "../services/events/event.api";

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