"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { DataTable } from "@/components/data-table";
import { AppLayout } from "@/components/layouts/app-layout";
import { useEventMetrics } from "../hooks/useEvents";
import React from "react";
import { getUserIdFromTokenCookie } from "../services/user/user.service";

export default function Page() {
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = getUserIdFromTokenCookie("token");
    setUserId(id);
  }, []);

  // Chamamos o hook SEMPRE, mas ele deve lidar com userId null
  const { metrics, loading } = useEventMetrics(userId);

  // Podemos mostrar carregando se userId ainda não tiver carregado
  const isLoading = loading || !userId;

  return (
    <AppLayout loading={isLoading}>
      <SectionCards
        totalEventosAno={metrics?.yearCreatedCount}
        proximoEventoNome={metrics?.nextEvent?.title ?? "Nenhum evento"}
        proximoEventoData={formatDate(metrics?.nextEvent?.datetime) ?? ""}
        totalEventosFuturos={metrics?.futureEventsCount}
        ultimoEventoNome={metrics?.lastCreatedEvent?.title ?? ""}
        ultimoEventoData={formatDate(metrics?.lastCreatedEvent?.datetime) ?? ""}
        ultimoEventoCriadoEm={formatDate(metrics?.lastCreatedEvent?.createdAt) ?? ""}
      />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive userId={userId ?? ""} />
      </div>
      <DataTable />
    </AppLayout>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
