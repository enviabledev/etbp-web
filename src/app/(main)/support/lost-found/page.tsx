"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Package } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/layout/AuthGuard";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

type Tab = "report" | "my-reports";

const CATEGORIES = [
  { value: "bag", label: "Bag / Luggage" },
  { value: "phone", label: "Phone" },
  { value: "wallet", label: "Wallet / Purse" },
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "documents", label: "Documents / ID" },
  { value: "keys", label: "Keys" },
  { value: "jewelry", label: "Jewelry" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS: Record<string, string> = {
  reported: "bg-yellow-100 text-yellow-700",
  investigating: "bg-blue-100 text-blue-700",
  found: "bg-green-100 text-green-700",
  returned: "bg-green-100 text-green-700",
  unclaimed: "bg-gray-100 text-gray-600",
  closed: "bg-gray-100 text-gray-600",
};

export default function LostFoundPage() {
  const [tab, setTab] = useState<Tab>("report");
  const [reportType, setReportType] = useState("lost");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [dateLostFound, setDateLostFound] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const toast = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ["my-lost-found"],
    queryFn: async () => { const { data } = await api.get("/api/v1/lost-found"); return data; },
    enabled: tab === "my-reports",
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/v1/lost-found", {
        report_type: reportType, item_category: category,
        item_description: description, color: color || undefined,
        date_lost_found: dateLostFound, location_details: location || undefined,
        contact_phone: user?.phone || "", contact_email: user?.email || "",
      });
      return data;
    },
    onSuccess: (data) => {
      setSubmitted(data.report_number);
      setDescription(""); setCategory(""); setColor(""); setLocation("");
      qc.invalidateQueries({ queryKey: ["my-lost-found"] });
      toast.success("Report submitted successfully");
    },
    onError: () => toast.error("Failed to submit report"),
  });

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/support" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Support
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Lost & Found</h1>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
          {(["report", "my-reports"] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setSubmitted(null); }}
              className={`px-5 py-2 rounded-md text-sm font-medium capitalize ${tab === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
              {t === "report" ? "Report an Item" : "My Reports"}
            </button>
          ))}
        </div>

        {tab === "report" && (
          submitted ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Report Submitted</h3>
              <p className="text-gray-500 mb-2">Your report number is <span className="font-mono font-bold">{submitted}</span></p>
              <p className="text-sm text-gray-400 mb-6">We&apos;ll notify you of any updates via push notification.</p>
              <Button onClick={() => setSubmitted(null)}>Submit Another</Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div className="flex gap-4">
                {["lost", "found"].map(t => (
                  <label key={t} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer ${reportType === t ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                    <input type="radio" name="type" value={t} checked={reportType === t} onChange={() => setReportType(t)} className="accent-blue-600" />
                    <span className="text-sm font-medium capitalize">I {t} something</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the item in detail..." rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g., Black" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={dateLostFound} onChange={e => setDateLostFound(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location details</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Under seat 7, at the terminal counter" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>

              <Button onClick={() => submitMutation.mutate()} loading={submitMutation.isPending} disabled={!category || !description.trim()}>
                Submit Report
              </Button>
            </div>
          )
        )}

        {tab === "my-reports" && (
          <div className="space-y-3">
            {(!reports || reports.length === 0) ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reports submitted yet</p>
              </div>
            ) : (
              reports.map((r: Record<string, string>) => (
                <div key={r.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{r.item_category} — {(r.item_description || "").substring(0, 60)}</p>
                    <p className="text-xs text-gray-500 mt-1">#{r.report_number} · {r.date_lost_found}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[r.status] || "bg-gray-100"}`}>{r.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
