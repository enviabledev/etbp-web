import Cookies from "js-cookie";
import api from "./api";
import type { TokenResponse, User } from "@/types";

export interface RegisterData {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
}

export async function login(
  email: string,
  password: string
): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/api/v1/auth/login", {
    email,
    password,
  });

  Cookies.set("access_token", data.access_token, { sameSite: "Lax" });
  Cookies.set("refresh_token", data.refresh_token, { sameSite: "Lax" });

  return data;
}

export async function register(payload: RegisterData): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>(
    "/api/v1/auth/register",
    payload
  );

  Cookies.set("access_token", data.access_token, { sameSite: "Lax" });
  Cookies.set("refresh_token", data.refresh_token, { sameSite: "Lax" });

  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = Cookies.get("refresh_token");
  try {
    await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
  } catch {
    // Swallow — we clear cookies regardless
  } finally {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
  }
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/api/v1/auth/me");
  return data;
}

export function isAuthenticated(): boolean {
  return !!Cookies.get("access_token");
}
