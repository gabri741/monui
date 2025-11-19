import { useState, useEffect } from "react";
import { NotificationChart } from "../services/notifications/notification.types";
import { getNotificationChartData } from "../services/notifications/notification.api";


export function useNotificationStats(userId: string, period: string) {
  const [data, setData] = useState<NotificationChart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNotificationChartData(userId, period)
      .then(setData)
      .catch((err) => {
        console.error(err);
        setData;
      })
      .finally(() => setLoading(false));
  }, [userId, period]);

  return { data, loading };
}