"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const redirectTo = searchParams.get("redirect") ?? "/";

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    try {
      // Register returns tokens now (auto-login)
      const { register: registerUser } = await import("@/lib/auth");
      await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        phone: data.phone || "",
      });

      // Refresh auth state by doing a full navigation
      window.location.href = redirectTo;
    } catch (err: any) {
      const responseData = err?.response?.data;
      if (responseData) {
        // Handle field-level errors from Django REST
        if (typeof responseData === "object" && !responseData.detail && !responseData.message) {
          const fieldErrors = Object.entries(responseData)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join(". ");
          setServerError(fieldErrors);
        } else {
          setServerError(
            responseData.detail ?? responseData.message ?? "Registration failed. Please try again."
          );
        }
      } else {
        setServerError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Create your account</h1>
        <p className="text-sm text-gray-500">Start booking trips with ETBP</p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First & Last name — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-[#1E293B] mb-1"
            >
              First name
            </label>
            <input
              id="first_name"
              type="text"
              autoComplete="given-name"
              {...registerField("first_name")}
              className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-[#1E293B] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 ${
                errors.first_name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-[#0057FF] focus:ring-[#0057FF]"
              }`}
              placeholder="John"
            />
            {errors.first_name && (
              <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-[#1E293B] mb-1"
            >
              Last name
            </label>
            <input
              id="last_name"
              type="text"
              autoComplete="family-name"
              {...registerField("last_name")}
              className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-[#1E293B] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 ${
                errors.last_name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-[#0057FF] focus:ring-[#0057FF]"
              }`}
              placeholder="Doe"
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-red-500">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1E293B] mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...registerField("email")}
            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-[#1E293B] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 ${
              errors.email
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-[#0057FF] focus:ring-[#0057FF]"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone (optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#1E293B] mb-1">
            Phone number{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...registerField("phone")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1E293B] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:border-[#0057FF] focus:ring-[#0057FF]"
            placeholder="08012345678"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#1E293B] mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...registerField("password")}
              className={`w-full rounded-lg border bg-gray-50 px-4 py-3 pr-11 text-sm text-[#1E293B] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 ${
                errors.password
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-[#0057FF] focus:ring-[#0057FF]"
              }`}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0057FF] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0047D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-medium text-[#0057FF] hover:text-[#0047D6]"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
