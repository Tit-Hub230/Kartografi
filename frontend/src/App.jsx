import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './leaflet-icons-fix';
import './App.css'
import MapLeaflet from './components/MapLeaflet';

function App() {
  
  const fallbackMarkers = [
    { id: 1, name: 'Prešeren Square', lat: 46.05108, lng: 14.50653, description: 'Center of Ljubljana' },
  ];

  return (
    <>
      <h1 style={{ margin: '12px 0' }}>Kartografi</h1>
      <p style={{ margin: '0 0 12px' }}>Click the map to add a local marker.</p>
      <MapLeaflet initialMarkers={fallbackMarkers} fetchFromBackend={true} />
    </>
  );
}

export default App
