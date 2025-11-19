"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "./data.json";
import { useEventMetrics } from "../hooks/useEvents";
import { DataTable } from "@/components/data-table";


export default function Page() {
  const { metrics, loading } = useEventMetrics("e3e1f37b-45b3-4a1f-93a7-89d21ce52a77");

if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="p-4">
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                totalEventosAno={metrics.yearCreatedCount}
                proximoEventoNome={metrics.nextEvent?.title ?? "Nenhum evento"}
                proximoEventoData={formatDate( metrics.nextEvent?.datetime) ?? ""}
                totalEventosFuturos={metrics.futureEventsCount}
                ultimoEventoNome={metrics.lastCreatedEvent?.title ?? ""}
                ultimoEventoData={formatDate(metrics.lastCreatedEvent?.datetime) ?? ""}
                ultimoEventoCriadoEm={formatDate(metrics.lastCreatedEvent?.createdAt) ?? ""}
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive userId="e3e1f37b-45b3-4a1f-93a7-89d21ce52a77" />
              </div>
              <DataTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}