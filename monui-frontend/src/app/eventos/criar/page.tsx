"use client";

import { useState } from "react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { eventService } from "@/app/services/events/event.service";
import { notificationService } from "@/app/services/notifications/notification.service";
import { AppLayout } from "@/components/layouts/app-layout";
import { getUserIdFromTokenCookie } from "@/app/services/user/user.service";
import React from "react";

export default function EventPage() {

 const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = getUserIdFromTokenCookie("token");
    setUserId(id);
  }, []);


  // ---------------- EVENTO ----------------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const createdBy = userId ?? "";

  const [eventCreated, setEventCreated] = useState(false);
  const [eventId, setEventId] = useState("");

  // ---------------- NOTIFICACAO
  const [remTitle, setRemTitle] = useState("");
  const [body, setBody] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
  const [triggerDates, setTriggerDates] = useState<string[]>([]);
  const [contacts, setContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState("");


  const handleCreateEvent = async () => {
    try {
      if (!title || !description || !eventDate) {
        toast.error("Preencha todos os campos do evento.");
        return;
      }

      const res = await eventService.createEvent({
        title,
        description,
        datetime: new Date(eventDate).toISOString(),
        createdBy,
      });

      setEventId(res.id);
      setEventCreated(true);
      toast.success("Evento criado com sucesso!");
    } catch {
      toast.error("Erro ao criar evento");
    }
  };


  const handleAddTrigger = () => {
    if (!newTrigger) return;
    setTriggerDates([...triggerDates, newTrigger]);
    setNewTrigger("");
  };


  const handleCreateReminder = async () => {
    try {
      if (
        !remTitle ||
        !body ||
        triggerDates.length === 0 ||
        contacts.length === 0
      ) {
        toast.error("Preencha todos os campos da notificação");
        return;
      }

      await notificationService.createReminder({
        title: remTitle,
        body,
        triggerDates,
        eventId,
        createdBy,
        recipients: contacts.map((phone) => ({
          phoneNumber: unmaskPhone(phone), // ← aqui
        })),
      });

      toast.success("Notificação criada com sucesso!");

      setRemTitle("");
      setBody("");
      setTriggerDates([]);
      setContacts([]);
    } catch {
      toast.error("Erro ao criar Notificação");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <div className="m-3">
          <h2 className="text-2xl font-bold">Criar Novo Evento</h2>
          <p className="text-muted-foreground text-sm">
            Preencha os detalhes abaixo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ---------------- CARD EVENTO ---------------- */}
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Dados do Evento</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Nome</FieldLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite o nome do evento"
                  />
                </Field>

                <Field>
                  <FieldLabel>Data</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Descrição</FieldLabel>

                <textarea
                  className="w-full border rounded-md p-2 h-60 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descreva os detalhes do seu evento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>

              <div className="flex justify-end">
                <Button onClick={handleCreateEvent} className="w-30">
                  Criar Evento
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ---------------- CARD NOTIFICAÇÃO ---------------- */}
          <Card
            className={`rounded-2xl shadow-lg ${
              !eventCreated ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>Notificação</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <Field>
                <FieldLabel>Nome</FieldLabel>
                <Input
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder="Digite o nome desta notificação"
                />
              </Field>

              <Field>
                <FieldLabel>Corpo da mensagem</FieldLabel>
                <textarea
                  className="w-full border rounded-md p-2 h-60 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Escreva a mensagem da notificação que será enviado para os seus contatos"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </Field>

              {/* Triggers */}
              <Field>
                <FieldLabel>Datas de Envio</FieldLabel>

                {triggerDates.map((t, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      type="datetime-local"
                      value={t}
                      onChange={(e) => {
                        const updated = [...triggerDates];
                        updated[i] = e.target.value;
                        setTriggerDates(updated);
                      }}
                    />

                    <Button
                      variant="destructive"
                      onClick={() =>
                        setTriggerDates(
                          triggerDates.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      Remover
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2 mt-2">
                  <Input
                    type="datetime-local"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                  />
                  <Button onClick={handleAddTrigger}>Adicionar</Button>
                </div>
              </Field>

              {/* Contatos */}
              <Field>
                <FieldLabel>Contatos</FieldLabel>

                {/* Lista de contatos existentes */}
                {contacts.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      value={c}
                      onChange={(e) => {
                        const masked = maskPhone(e.target.value);

                        const digits = masked.replace(/\D/g, "");
                        if (digits.length <= 11) {
                          const updated = [...contacts];
                          updated[i] = masked;
                          setContacts(updated);
                        }
                      }}
                      placeholder="Telefone"
                    />

                    <Button
                      variant="destructive"
                      onClick={() =>
                        setContacts(contacts.filter((_, idx) => idx !== i))
                      }
                    >
                      Remover
                    </Button>
                  </div>
                ))}

                {/* Campo para adicionar novo contato */}
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newContact}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      const digits = masked.replace(/\D/g, "");

                      if (digits.length <= 11) {
                        setNewContact(masked);
                      }
                    }}
                    placeholder="Telefone"
                  />

                  <Button
                    onClick={() => {
                      if (!newContact) return;

                      setContacts([...contacts, newContact]);
                      setNewContact("");
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
              </Field>

              <div className="flex justify-end">
                <Button onClick={handleCreateReminder} className="w-40">
                  Criar Notificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export function maskPhone(value: string) {
  value = value.replace(/\D/g, ""); // remove tudo que não é número

  // Limita a 11 dígitos
  value = value.slice(0, 11);

  if (value.length <= 2) {
    return `(${value}`;
  }
  if (value.length <= 6) {
    return `(${value.slice(0, 2)}) ${value.slice(2)}`;
  }
  return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
}

export function unmaskPhone(value: string): string {
  // Remove tudo que não for número
  let digits = value.replace(/\D/g, "");

  // Limita ao máximo de 11 dígitos
  digits = digits.slice(0, 11);

  // Telefone inválido
  if (digits.length < 10) {
    throw new Error("Telefone inválido");
  }

  // Formato E.164
  return `+55${digits}`;
}
