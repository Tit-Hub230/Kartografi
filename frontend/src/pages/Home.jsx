// src/pages/Home.jsx
import { useRef } from "react";
import MapLeaflet from "../components/MapLeaflet";
import countriesGeo from "../assets/countries.json"; // <- add the file under src/assets/

export default function Home() {
  const mapRef = useRef(null);

  return (
    <div className="main-wrap">
      <div className="hero">
        <h1>Explore the map</h1>
        <p>Click anywhere to drop a marker. Countries are outlined & clickable.</p>
      </div>

      <div className="map-card">
        <div className="map-toolbar">
          <span className="toolbar-title">Ljubljana</span>
          <input className="search" placeholder="Search places (UI only)" />
          <div className="toolbar-spacer" />
          <button className="tool" onClick={() => mapRef.current?.recenter()}>Recenter</button>
          <button className="tool" onClick={() => mapRef.current?.locate()}>My location</button>
        </div>

        <div style={{ height: "75vh" }}>
          <MapLeaflet
            ref={mapRef}
            zoom={4}
            fetchFromBackend={false}
            countriesData={countriesGeo}   // <- no fetch, no 404s
          />
        </div>
      </div>
    </div>
  );
}