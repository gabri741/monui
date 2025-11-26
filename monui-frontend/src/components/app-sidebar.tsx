"use client";

import * as React from "react";
import { jwtDecode } from "jwt-decode";


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

import { Calendar, Inbox, LucideLayoutDashboard } from "lucide-react";
import { IconHelp, IconSettings } from "@tabler/icons-react";
import { getCookie } from "cookies-next";

// -----------------------------
// Menus fixos
// -----------------------------
const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: LucideLayoutDashboard },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Eventos", url: "/eventos", icon: Inbox },
];

const navSecondary = [
  { title: "Configurações", url: "/config", icon: IconSettings },
  { title: "Ajuda", url: "/help", icon: IconHelp },
];

// -----------------------------
// Decodificação do token
// -----------------------------
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TokenPayload {
  user: User;
  iat?: number;
  exp?: number;
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
  try {
    const token = getCookie("token"); 
    if (!token) return;

    const decoded: TokenPayload = jwtDecode(token as string);

    if (decoded?.user) {
      setUser(decoded.user);
    }
  } catch (err) {
    console.error("Erro ao carregar token:", err);
  }
}, []);
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Usuário";
  const displayEmail = user?.email ?? "email@dominio.com";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      
      {/* Header com Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="!p-5">
              <a href="#">
                <div className="flex items-center gap-3">
                  <img src="/monui-logo.png" alt="Logo" className="h-10 w-auto" />
                  <h1 className="text-xl font-bold">M O N U I</h1>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Conteúdo */}
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* Dados do usuário */}
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName,
            email: displayEmail,
            avatar: "/avatars/default.png",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
