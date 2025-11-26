import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

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

/**
 * Recupera o user.id do token armazenado no cookie
 */
export function getUserIdFromTokenCookie(cookieName: string = "token"): string | null {
  try {
    const token = getCookie(cookieName);
    if (!token) return null;

    const decoded: TokenPayload = jwtDecode(token as string);
    
    return decoded?.user?.id || null;
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    return null;
  }
}
