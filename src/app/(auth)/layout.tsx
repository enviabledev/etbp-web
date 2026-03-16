import Link from "next/link";
import { Bus } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-8">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Bus className="h-8 w-8 text-[#0057FF]" />
        <span className="text-2xl font-bold text-[#1E293B]">ETBP</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {children}
      </div>

      {/* Footer text */}
      <p className="mt-6 text-xs text-gray-400">
        &copy; 2026 Enviable Transport. All rights reserved.
      </p>
    </div>
  );
}
