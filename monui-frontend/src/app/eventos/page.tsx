"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layouts/app-layout";
import { useEvents } from "../hooks/useEvents";
import { Search, Plus } from "lucide-react";
import React from "react";
import { getUserIdFromTokenCookie } from "../services/user/user.service";

interface Event {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  createdAt: string;
}

export default function EventsTable() {

   const [userId, setUserId] = React.useState<string | null>(null);
  
    React.useEffect(() => {
      const id = getUserIdFromTokenCookie("token");
      setUserId(id);
    }, []);


  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, totalPages, loading } = useEvents(page, 10, "", userId ?? "");

  return (
    <AppLayout loading={loading && page === 1}>
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Gerenciar Eventos
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Botão Criar Evento */}
            <div className="flex justify-between items-center mb-6">
              <Button onClick={() => router.push("/eventos/criar")}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Evento
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%]">Título</TableHead>
                    <TableHead className="w-[35%]">Descrição</TableHead>
                    <TableHead className="w-[20%]">Data do Evento</TableHead>
                    <TableHead className="w-[20%]">Criado em</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {/* LOADING */}
                  {loading &&
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* EMPTY */}
                  {!loading && data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 opacity-50" />
                          <p className="text-sm">Nenhum evento cadastrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* DATA */}
                  {!loading &&
                    data.map((event: Event) => (
                      <TableRow key={event.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {event.description || (
                            <span className="italic">Sem descrição</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(event.datetime)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(event.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!loading && data.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>

                <span className="text-sm text-muted-foreground">
                  Página <span className="font-medium">{page}</span> de{" "}
                  <span className="font-medium">{totalPages}</span>
                </span>

                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  
  const date = new Date(dateStr);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}