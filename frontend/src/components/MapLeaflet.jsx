import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Type of marker we expect
// { id: string|number, name: string, lat: number, lng: number, description?: string }

function ClickToAddMarker({ onAdd }) {
  useMapEvents({
    click(e) {
      onAdd?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapLeaflet({
  center = { lat: 46.0569, lng: 14.5058 }, // Ljubljana default
  zoom = 12,
  initialMarkers = [],
  fetchFromBackend = true,     // set false if you don't want to fetch
}) {
  const [markers, setMarkers] = useState(initialMarkers);
  const apiBase = import.meta.env.VITE_API_URL; // e.g. http://localhost:5000

  // Fetch demo markers from backend
  useEffect(() => {
    if (!fetchFromBackend || !apiBase) return;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/places`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // expects array of {id,name,lat,lng,description?}
        setMarkers((prev) => {
          // prefer server data if present
          return Array.isArray(data) && data.length ? data : prev;
        });
      } catch (e) {
        console.error('Failed to fetch markers:', e);
      }
    })();
  }, [apiBase, fetchFromBackend]);

  const mapCenter = useMemo(() => [center.lat, center.lng], [center]);

  function handleAddClick(pos) {
    // Add a temporary marker locally
    const id = `local-${Date.now()}`;
    setMarkers((m) => [
      ...m,
      { id, name: 'New point', lat: pos.lat, lng: pos.lng, description: 'Added locally' },
    ]);
    // Here’s where you’d POST to your backend if you want to persist:
    // fetch(`${apiBase}/api/places`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name:'New point', ...pos}) })
  }

  return (
    <div style={{ height: '80vh', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          // Free, no-key OSM tiles for development. For production, consider a provider with an API key.
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToAddMarker onAdd={handleAddClick} />

        {markers.map((m) => (
          <Marker key={m.id ?? `${m.lat},${m.lng}`} position={[m.lat, m.lng]} icon={new L.Icon.Default()}>
            <Popup>
              <strong>{m.name ?? 'Unnamed place'}</strong>
              {m.description ? <p style={{ margin: '6px 0 0' }}>{m.description}</p> : null}
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>
                {m.lat.toFixed(5)}, {m.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}