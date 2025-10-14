import MapLeaflet from "../components/MapLeaflet";

export default function Home() {
  return (
    <div className="main-wrap">
      <div className="hero">
        <h1>Explore the map</h1>
        <p>Click anywhere to drop a marker. Data fetched from the backend.</p>
      </div>

      <div className="map-card">
        <div className="map-toolbar">
          <span className="toolbar-title">Ljubljana</span>
          <input className="search" placeholder="Search places (UI only)" />
          <div className="toolbar-spacer" />
          <button className="tool">Recenter</button>
          <button className="tool">My location</button>
        </div>

        {/* Map takes the remaining space of the card */}
        <div style={{ height: "75vh" }}>
          <MapLeaflet />
        </div>
      </div>
    </div>
  );
}