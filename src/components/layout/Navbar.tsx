"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bus, Menu, X, ChevronDown, User, Wallet, LogOut, Ticket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Bus className="h-7 w-7 text-[#0057FF]" />
              <span className="text-xl font-bold text-[#1E293B]">ETBP</span>
            </Link>

            {/* Center nav links — desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/search"
                className="text-sm font-medium text-[#1E293B] hover:text-[#0057FF] transition-colors"
              >
                Search Trips
              </Link>
              {isAuthenticated && (
                <Link
                  href="/my-trips"
                  className="text-sm font-medium text-[#1E293B] hover:text-[#0057FF] transition-colors"
                >
                  My Trips
                </Link>
              )}
              <Link
                href="/support"
                className="text-sm font-medium text-[#1E293B] hover:text-[#0057FF] transition-colors"
              >
                Support
              </Link>
            </div>

            {/* Right side — desktop */}
            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg border border-[#0057FF] px-4 py-2 text-sm font-medium text-[#0057FF] hover:bg-[#0057FF]/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-[#0057FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0047D6] transition-colors"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#1E293B] hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0057FF] text-white text-xs font-bold">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </div>
                    <span>
                      {user?.first_name} {user?.last_name}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <Link
                        href="/my-trips"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-gray-50"
                      >
                        <Ticket className="h-4 w-4 text-gray-400" />
                        My Trips
                      </Link>
                      <Link
                        href="/wallet"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-gray-50"
                      >
                        <Wallet className="h-4 w-4 text-gray-400" />
                        Wallet
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Profile
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#1E293B] hover:bg-gray-100"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={closeMobile}>
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Mobile slide-out drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-[#0057FF]" />
            <span className="text-lg font-bold text-[#1E293B]">ETBP</span>
          </div>
          <button
            onClick={closeMobile}
            className="p-2 rounded-lg text-[#1E293B] hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-1">
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0057FF] text-white text-sm font-bold">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-[#1E293B]">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}

          <Link
            href="/search"
            onClick={closeMobile}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-gray-50"
          >
            Search Trips
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/my-trips"
                onClick={closeMobile}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-gray-50"
              >
                My Trips
              </Link>
              <Link
                href="/wallet"
                onClick={closeMobile}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-gray-50"
              >
                Wallet
              </Link>
              <Link
                href="/profile"
                onClick={closeMobile}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-gray-50"
              >
                Profile
              </Link>
            </>
          )}
          <Link
            href="/support"
            onClick={closeMobile}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-gray-50"
          >
            Support
          </Link>

          <hr className="my-3 border-gray-100" />

          {!isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={closeMobile}
                className="rounded-lg border border-[#0057FF] px-4 py-2.5 text-center text-sm font-medium text-[#0057FF] hover:bg-[#0057FF]/5"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={closeMobile}
                className="rounded-lg bg-[#0057FF] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#0047D6]"
              >
                Register
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
}
