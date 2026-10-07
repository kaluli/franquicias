"use server";

import { cookies } from "next/headers";
import { COOKIE, SESSION_MAX_AGE, createToken } from "./session";

export async function login(password: string): Promise<{ ok: boolean; error?: string }> {
  const expected = process.env.APP_PASSWORD;
  if (!expected || !process.env.SESSION_SECRET) {
    return { ok: false, error: "Faltan APP_PASSWORD / SESSION_SECRET en las variables de entorno." };
  }
  if (password !== expected) return { ok: false, error: "Contraseña incorrecta." };
  (await cookies()).set(COOKIE, await createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
