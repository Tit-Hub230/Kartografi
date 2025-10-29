// src/components/MapLeaflet.jsx
import { useEffect, useMemo, useState, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// Click-to-add disabled for quiz mode
function ClickToAddMarker() {
  // Disabled - we don't want markers placed during quiz
  return null;
}

// Countries layer that can use inline data OR fetch a URL
function CountriesLayer({ data, dataUrl, onCountryClick, selectedCountry }) {
  const [geo, setGeo] = useState(data ?? null);

  useEffect(() => {
    if (data || !dataUrl) return; // already have data or no URL given
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(dataUrl, { cache: 'no-cache' });
        if (!res.ok) {
          console.warn(`CountriesLayer: ${dataUrl} returned HTTP ${res.status}`);
          return;
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json') && !ct.includes('geo+json')) {
          const text = await res.text();
          console.warn('CountriesLayer: response is not JSON. First bytes:', text.slice(0, 120));
          return;
        }
        const json = await res.json();
        if (!cancelled) setGeo(json);
      } catch (e) {
        console.warn('CountriesLayer: failed to load', e);
      }
    })();
    return () => { cancelled = true; };
  }, [data, dataUrl]);

  const baseStyle = { weight: 1, color: '#1f2937', opacity: 0.9, fillColor: '#60a5fa', fillOpacity: 0.15 };
  const highlightStyle = { weight: 2, color: '#2563eb', fillOpacity: 0.25 };
  const selectedStyle = { weight: 3, color: '#10b981', fillColor: '#10b981', fillOpacity: 0.4 };

  function onEachFeature(feature, layer) {
    const name = feature?.properties?.name || feature?.properties?.ADMIN || 'Unknown country';
    const iso = (feature?.properties?.ISO_A2 || feature?.properties?.iso_a2 || '').toUpperCase().trim();
    const iso3 = (feature?.properties?.ISO_A3 || feature?.properties?.iso_a3 || '').toUpperCase().trim();
    const selectedIso = (selectedCountry?.properties?.ISO_A2 || selectedCountry?.properties?.iso_a2 || '').toUpperCase().trim();
    const selectedIso3 = (selectedCountry?.properties?.ISO_A3 || selectedCountry?.properties?.iso_a3 || '').toUpperCase().trim();
    const selectedName = (selectedCountry?.properties?.name || selectedCountry?.properties?.ADMIN || '').trim();
    
    layer.bindTooltip(name, { sticky: true });

    // Check if this is the selected country using multiple criteria
    // Compare ISO-2, ISO-3 (excluding "-99" placeholder), and fallback to name comparison
    const isSelected = selectedCountry && (
      (iso && selectedIso && iso.length === 2 && iso !== '-99' && iso === selectedIso) ||
      (iso3 && selectedIso3 && iso3.length === 3 && iso3 !== '-99' && iso3 === selectedIso3) ||
      (name && selectedName && name === selectedName)
    );

    if (isSelected) {
      layer.setStyle(selectedStyle);
    }

    layer.on({
      mouseover: (e) => { 
        if (!isSelected) {
          e.target.setStyle(highlightStyle); 
        }
        e.target.bringToFront?.(); 
      },
      mouseout: (e) => {
        if (!isSelected) {
          e.target.setStyle(baseStyle);
        } else {
          e.target.setStyle(selectedStyle);
        }
      },
      click: (e) => {
        // Don't show popup - just trigger the click handler
        onCountryClick?.(feature, e);
      },
    });
  }

  if (!geo) return null;
  return <GeoJSON data={geo} style={() => baseStyle} onEachFeature={onEachFeature} key={JSON.stringify(selectedCountry)} />;
}

const MapLeaflet = forwardRef(function MapLeaflet(
  {
    center = { lat: 46.0569, lng: 14.5058 },
    zoom = 4,
    initialMarkers = [],
    fetchFromBackend = false,
    countriesData,                // <- NEW: pass inline GeoJSON
    countriesUrl,                 // optional fallback URL
    onCountryClick,               // <- NEW: callback for country clicks
    selectedCountry,              // <- NEW: currently selected country for highlighting
  },
  ref
) {
  const [markers, setMarkers] = useState(initialMarkers);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5050";

  useEffect(() => {
    if (!fetchFromBackend || !apiBase) return;
    (async () => {
      try {
        const res = await fetch(`${apiBase}api/places`, { cache: 'no-cache' });
        if (res.status === 404) {
          console.warn('No /api/places route (404). Skipping markers fetch.');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length) setMarkers(data);
      } catch (e) {
        console.warn('Failed to fetch markers:', e);
      }
    })();
  }, [apiBase, fetchFromBackend]);

  const mapCenter = useMemo(() => [center.lat, center.lng], [center]);

  function MapControlBridge() {
    const map = useMap();
    useImperativeHandle(ref, () => ({
      recenter: () => map.flyTo(mapCenter, zoom, { duration: 0.6 }),
      locate: () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.flyTo([latitude, longitude], Math.max(12, zoom), { duration: 0.6 });
            L.marker([latitude, longitude]).addTo(map).bindPopup('You are here').openPopup();
          },
          (err) => console.warn('Geolocation error:', err),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      },
    }), [map]);
    return null;
  }

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        preferCanvas
        worldCopyJump
        attributionControl
        zoomControl
      >
        <MapControlBridge />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CountriesLayer 
          data={countriesData} 
          dataUrl={countriesUrl} 
          onCountryClick={onCountryClick}
          selectedCountry={selectedCountry}
        />

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
});

export default MapLeaflet;
