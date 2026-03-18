"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { googleSignIn } from "@/lib/social-auth";
import { useState } from "react";

interface SocialLoginButtonsProps {
  redirectTo?: string;
  onError?: (message: string) => void;
}

export default function SocialLoginButtons({
  redirectTo = "/",
  onError,
}: SocialLoginButtonsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      const result = await googleSignIn(credentialResponse.credential);
      // Invalidate the auth query so AuthContext picks up the new user
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (result.is_new_user) {
        router.push("/profile");
      } else {
        router.push(redirectTo);
      }
    } catch (e: unknown) {
      const msg =
        (e as Record<string, Record<string, Record<string, string>>>)?.response
          ?.data?.detail || "Google sign-in failed";
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">or continue with</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => onError?.("Google sign-in failed")}
          size="large"
          width="100%"
          text="continue_with"
          shape="rectangular"
          theme="outline"
        />
      </div>

      {loading && (
        <p className="text-center text-sm text-gray-500">Signing in...</p>
      )}
    </div>
  );
}
