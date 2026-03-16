"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, Save, Loader2 } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/queries/useProfile";
import { useToast } from "@/components/ui/Toast";

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

function ProfileContent() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const [form, setForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || "",
        emergency_contact_name: user.emergency_contact_name || "",
        emergency_contact_phone: user.emergency_contact_phone || "",
      });
    }
  }, [user]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
      });
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || "Failed to update profile."
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-[#1E293B] placeholder-gray-400 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] focus:outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#0057FF] flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">My Profile</h1>
            <p className="text-sm text-gray-500">
              Manage your personal information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (read-only) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-[#1E293B] mb-4">
              Account
            </h2>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Personal info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-[#1E293B] mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className={labelClass}>
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={form.first_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label htmlFor="last_name" className={labelClass}>
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={form.last_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div>
                <label htmlFor="date_of_birth" className={labelClass}>
                  Date of Birth
                </label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="gender" className={labelClass}>
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Emergency contact */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-[#1E293B] mb-4">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergency_contact_name" className={labelClass}>
                  Contact Name
                </label>
                <input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  type="text"
                  value={form.emergency_contact_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label htmlFor="emergency_contact_phone" className={labelClass}>
                  Contact Phone
                </label>
                <input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  type="tel"
                  value={form.emergency_contact_phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0046CC] transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
