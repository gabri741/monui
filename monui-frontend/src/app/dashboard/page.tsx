"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { DataTable } from "@/components/data-table";
import { AppLayout } from "@/components/layouts/app-layout";
import { useEventMetrics } from "../hooks/useEvents";

export default function Page() {
  const { metrics, loading } = useEventMetrics(
    "e3e1f37b-45b3-4a1f-93a7-89d21ce52a77"
  );

  return (
    <AppLayout loading={loading}>
      <SectionCards
        totalEventosAno={metrics?.yearCreatedCount}
        proximoEventoNome={metrics?.nextEvent?.title ?? "Nenhum evento"}
        proximoEventoData={formatDate(metrics?.nextEvent?.datetime) ?? ""}
        totalEventosFuturos={metrics?.futureEventsCount}
        ultimoEventoNome={metrics?.lastCreatedEvent?.title ?? ""}
        ultimoEventoData={formatDate(metrics?.lastCreatedEvent?.datetime) ?? ""}
        ultimoEventoCriadoEm={
          formatDate(metrics?.lastCreatedEvent?.createdAt) ?? ""
        }
      />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive userId="e3e1f37b-45b3-4a1f-93a7-89d21ce52a77" />
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