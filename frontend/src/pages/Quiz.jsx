// src/pages/Quiz.jsx
import { useMemo, useRef, useState } from "react";
import MapLeaflet from "../components/MapLeaflet";
import countriesGeo from "../assets/countries.json"; // rename .geojson -> .json or import with ?raw/?url

// Helpers to read common Natural Earth props (adjust if yours differ)
function featureIso2(f) {
  return (f?.properties?.ISO_A2 || f?.properties?.iso_a2 || "").toUpperCase();
}
function featureName(f) {
  return f?.properties?.NAME || f?.properties?.ADMIN || f?.properties?.name || "Unknown";
}

export default function Quiz() {
  const mapRef = useRef(null);

  // Use only features with a valid ISO2, and skip Antarctica ("AQ")
  const features = useMemo(() => {
    const list = (countriesGeo?.features || []).filter(f => {
      const iso = featureIso2(f);
      return iso && iso !== "AQ";
    });
    return list;
  }, []);

  // pick a random target index
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * (features.length || 1)));
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(""); // "", "correct", or "wrong"

  const target = features[idx];
  const targetName = target ? featureName(target) : "…";

  function nextQuestion() {
    setFeedback("");
    if (!features.length) return;
    // naive random; feel free to avoid repeats later
    const next = Math.floor(Math.random() * features.length);
    setIdx(next);
    // optionally: mapRef.current?.recenter();
  }

  // Called when a country polygon is clicked (wire this through CountriesLayer)
  function handleCountryClick(feature) {
    if (!target || !feature) return;
    const isoClicked = featureIso2(feature);
    const isoTarget = featureIso2(target);
    if (isoClicked === isoTarget) {
      setScore(s => s + 1);
      setFeedback("correct");
      // zoom/center behavior already handled inside the layer
    } else {
      setFeedback("wrong");
    }
  }

  return (
    <div className="main-wrap">
      <div className="map-card">
        {/* Quiz HUD */}
        <div className="map-toolbar" style={{ borderBottom: "1px solid #eef0f3" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="toolbar-title">Find this country:</span>
            <span style={{ fontWeight: 700 }}>{targetName}</span>
          </div>
          <div className="toolbar-spacer" />
          <div>Score: <strong>{score}</strong></div>
          <button className="tool" onClick={() => mapRef.current?.recenter()}>Recenter</button>
          <button className="tool" onClick={() => mapRef.current?.locate()}>My location</button>
          <button className="tool" onClick={nextQuestion}>Next</button>
        </div>

        {/* Feedback strip */}
        {feedback && (
          <div style={{
            padding: "8px 12px",
            background: feedback === "correct" ? "#ecfdf5" : "#fff7ed",
            color: feedback === "correct" ? "#065f46" : "#9a3412",
            borderBottom: "1px solid #eef0f3"
          }}>
            {feedback === "correct" ? "✅ Correct!" : "❌ Not that one, try again."}
          </div>
        )}

        {/* Map */}
        <div className="map-viewport">
          <MapLeaflet
            ref={mapRef}
            zoom={4}
            fetchFromBackend={false}
            countriesData={countriesGeo}
            onCountryClick={handleCountryClick}  // <- ensure your CountriesLayer calls this
          />
        </div>

        {/* Footer (optional controls) */}
        <div style={{ display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid #eef0f3", background: "#fff" }}>
          <button className="tool" onClick={nextQuestion}>Skip</button>
          <div style={{ flex: 1 }} />
          <button className="tool" onClick={() => mapRef.current?.recenter()}>Recenter</button>
        </div>
      </div>
    </div>
  );
}