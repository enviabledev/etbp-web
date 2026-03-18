"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function BannerSection() {
  const { data: banners } = useQuery({
    queryKey: ["banners", "home_hero"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/banners", { params: { placement: "home_hero" } });
      return data;
    },
    staleTime: 60000,
  });

  if (!banners || banners.length === 0) return null;
  const banner = banners[0];

  const handleClick = async () => {
    await api.post(`/api/v1/banners/${banner.id}/click`).catch(() => {});
    if (banner.cta_action === "url" && banner.cta_value) {
      window.open(banner.cta_value, "_blank");
    }
  };

  return (
    <div
      className="rounded-xl p-8 mb-6 cursor-pointer"
      style={{ backgroundColor: banner.background_color || "#0057FF", color: banner.text_color || "#FFFFFF" }}
      onClick={handleClick}
    >
      {banner.image_url && <img src={banner.image_url} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
      {banner.heading && <h2 className="text-2xl font-bold">{banner.heading}</h2>}
      {banner.body_text && <p className="mt-2 opacity-90">{banner.body_text}</p>}
      {banner.cta_text && (
        <button className="mt-4 px-6 py-2 bg-white/20 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors">
          {banner.cta_text}
        </button>
      )}
    </div>
  );
}
