import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
  loading?: boolean;
}

export function AppLayout({ children, loading = false }: AppLayoutProps) {
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />

          {/* Loading Animado */}
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
   
    <SidebarProvider
      style={{
        ["--sidebar-width" as any]: "calc(var(--spacing) * 72)",
        ["--header-height" as any]: "calc(var(--spacing) * 12)",
      }}
    >
      <Toaster position="top-center" richColors closeButton />
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
