import { useState, useEffect } from "react";
import { NotificationRecipient } from "../services/notifications/notification.types";
import { getRecipientsByUser} from "../services/notifications/notification.api";

export function useRecipientsByUser(
  userId: string,
  page: number,
  limit: number
) {
  const [data, setData] = useState<NotificationRecipient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    getRecipientsByUser(userId, page, limit)
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
        setTotal(res.total);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) {
          setData([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId, page, limit]);

  return { data, total, loading };
}
