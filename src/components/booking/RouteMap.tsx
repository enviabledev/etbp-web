"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in Next.js
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const grayIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface MapPoint {
  name: string;
  city?: string;
  latitude: number | null;
  longitude: number | null;
}

interface RouteMapProps {
  origin: MapPoint | null;
  destination: MapPoint | null;
  stops?: MapPoint[];
  distanceKm?: number | null;
  durationMinutes?: number | null;
}

function FitBounds({ points }: { points: L.LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [map, points]);
  return null;
}

export default function RouteMap({ origin, destination, stops = [], distanceKm, durationMinutes }: RouteMapProps) {
  if (!origin?.latitude || !destination?.latitude) return null;

  const allPoints: L.LatLngExpression[] = [
    [origin.latitude, origin.longitude!],
    ...stops.filter(s => s.latitude && s.longitude).map(s => [s.latitude!, s.longitude!] as L.LatLngExpression),
    [destination.latitude, destination.longitude!],
  ];

  const hours = durationMinutes ? Math.floor(durationMinutes / 60) : null;
  const mins = durationMinutes ? durationMinutes % 60 : null;

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 280 }}>
        <MapContainer center={[origin.latitude, origin.longitude!]} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <Marker position={[origin.latitude, origin.longitude!]} icon={blueIcon}>
            <Popup>{origin.name}</Popup>
          </Marker>
          <Marker position={[destination.latitude, destination.longitude!]} icon={redIcon}>
            <Popup>{destination.name}</Popup>
          </Marker>
          {stops.filter(s => s.latitude && s.longitude).map((s, i) => (
            <Marker key={i} position={[s.latitude!, s.longitude!]} icon={grayIcon}>
              <Popup>{s.name}</Popup>
            </Marker>
          ))}
          <Polyline positions={allPoints} color="#0057FF" weight={3} />
          <FitBounds points={allPoints} />
        </MapContainer>
      </div>
      {(distanceKm || durationMinutes) && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          {distanceKm ? `${Math.round(distanceKm)} km` : ""}{distanceKm && durationMinutes ? " · " : ""}
          {hours ? `~${hours}h${mins ? ` ${mins}m` : ""}` : ""}{stops.length > 0 ? ` · ${stops.length} stop${stops.length > 1 ? "s" : ""}` : ""}
        </p>
      )}
    </div>
  );
}
