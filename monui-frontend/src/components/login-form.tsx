"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setCookie } from "cookies-next";
import { GoogleLogin } from "@react-oauth/google";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading global

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_AUTH_API_URL + "/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Credenciais inválidas");
        return;
      }

      setCookie("token", data.access_token, {
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      toast.success("Login realizado com sucesso!");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("relative flex flex-col gap-6", className)} {...props}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 rounded-xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}

      <Card className={loading ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem vindo</CardTitle>
          <CardDescription>
            Realize o login com o Google ou E-mail
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    const idToken = credentialResponse.credential;
                    if (!idToken)
                      return toast.error("Falha ao obter credencial do Google");

                    setLoading(true); 

                    try {
                      // Enviar token para o backend
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id_token: idToken }),
                        }
                      );

                      if (!res.ok) {
                        const data = await res.json();
                        return toast.error(
                          data.message || "Falha ao autenticar com Google"
                        );
                      }

                      const { access_token } = await res.json();

    
                      setCookie("token", access_token, {
                        maxAge: 60 * 60 * 24,
                        path: "/",
                      });

                      toast.success("Autenticado com Google!");
                      router.push("/dashboard");
                    } catch (err) {
                      console.error(err);
                      toast.error("Erro ao autenticar com Google");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => toast.error("Erro ao autenticar com Google")}
                />
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Ou continue com
              </FieldSeparator>

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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
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
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Entrando...
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>

                <FieldDescription className="text-center mt-2">
                  Não possui uma conta?{" "}
                  <a href="/register" className="underline">
                    Cadastra-se
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
