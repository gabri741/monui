"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import { setCookie } from "cookies-next";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, birthDate, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Erro ao registrar");
        return;
      }

      setCookie("token", data.access_token, { maxAge: 60 * 60 * 24, path: "/" });
      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">

      <Toaster position="top-center" richColors closeButton />

      <h1 className="text-2xl font-bold mb-6 text-center">M O N U I</h1>

      <Card className="w-full max-w-sm shadow-lg rounded-lg">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50 rounded-lg">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        )}

        <CardHeader className="text-center">
          <CardTitle className="text-xl">Crie sua conta</CardTitle>
          <CardDescription>Preencha os campos abaixo para registrar-se</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="firstName">Nome</FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  required
                  disabled={loading}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">Sobrenome</FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  required
                  disabled={loading}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="birthDate">Data de nascimento</FieldLabel>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  disabled={loading}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>

              <Field className="mt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registrando..." : "Registrar"}
                </Button>
                <FieldDescription className="text-center mt-2">
                  Já possui uma conta?{" "}
                  <a href="/login" className="underline">
                    Faça login
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
