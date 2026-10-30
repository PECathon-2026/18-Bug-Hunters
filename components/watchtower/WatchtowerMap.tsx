"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

export type MapSite = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  notes?: string;
  distanceKm?: number;
  score?: number | null;
  scoreLabel?: string;
  lightPollution?: number | null;
  provenance?: string;
  source?: string;
};

type WatchtowerMapProps = {
  center: { latitude: number; longitude: number };
  sites: MapSite[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

const observerIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:999px;background:#c4454d;border:2px solid #ffffff;box-shadow:0 0 12px rgba(196,69,77,0.95);animation:pulse 2s infinite"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const defaultSiteIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:999px;background:#c4a35a;border:2px solid #e8eef8;box-shadow:0 0 8px rgba(196,163,90,0.6)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const selectedSiteIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:999px;background:#e0c987;border:3px solid #6b1f28;box-shadow:0 0 16px rgba(224,201,135,1)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [lat, lon, map]);
  return null;
}

export function WatchtowerMap({
  center,
  sites,
  selectedId,
  onSelect,
}: WatchtowerMapProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)]">
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={5}
        scrollWheelZoom
        className="h-[360px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={center.latitude} lon={center.longitude} />
        <Marker position={[center.latitude, center.longitude]} icon={observerIcon}>
          <Popup>
            <strong>Your Observing Base</strong>
            <br />
            Lat: {center.latitude.toFixed(4)}, Lon: {center.longitude.toFixed(4)}
          </Popup>
        </Marker>
        {sites.map((site) => {
          const isSelected = selectedId === site.id;
          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={isSelected ? selectedSiteIcon : defaultSiteIcon}
              eventHandlers={{
                click: () => onSelect?.(site.id),
              }}
            >
              <Popup>
                <strong>{site.name}</strong>
                <br />
                {site.distanceKm != null
                  ? `${site.distanceKm.toFixed(0)} km from base`
                  : null}
                <br />
                {site.score != null
                  ? `Night Honor: ${site.score} (${site.scoreLabel})`
                  : "Score pending"}
                <br />
                <em>{site.notes || site.provenance || "curated site"}</em>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {selectedId ? (
        <p className="bg-[rgba(11,18,32,0.9)] px-3 py-2 text-xs text-[var(--mist)]">
          Selected marker: <span className="text-[var(--gold-soft)] font-medium">{sites.find((s) => s.id === selectedId)?.name ?? selectedId}</span>
        </p>
      ) : null}
    </div>
  );
}
