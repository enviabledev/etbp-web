import Cookies from "js-cookie";
import api from "@/lib/api";
import type { TokenResponse } from "@/types";

interface SocialAuthResponse extends TokenResponse {
  is_new_user?: boolean;
}

export async function googleSignIn(idToken: string): Promise<SocialAuthResponse> {
  const { data } = await api.post<SocialAuthResponse>("/api/v1/auth/google", {
    id_token: idToken,
  });

  Cookies.set("access_token", data.access_token, { sameSite: "Lax" });
  Cookies.set("refresh_token", data.refresh_token, { sameSite: "Lax" });

  return data;
}

export async function appleSignIn(
  idToken: string,
  firstName?: string,
  lastName?: string
): Promise<SocialAuthResponse> {
  const { data } = await api.post<SocialAuthResponse>("/api/v1/auth/apple", {
    id_token: idToken,
    first_name: firstName,
    last_name: lastName,
  });

  Cookies.set("access_token", data.access_token, { sameSite: "Lax" });
  Cookies.set("refresh_token", data.refresh_token, { sameSite: "Lax" });

  return data;
}
