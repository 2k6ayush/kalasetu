import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Next.js/Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle flying to the new location smoothly
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 2 // smooth animation
      });
    }
  }, [center, zoom, map]);

  return null;
}

export default function DynamicMap({ center, zoom, marker, exploredPlaces = [], onMarkerClick }) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} zoom={zoom} />
      
      {/* Historical Explored Places Markers */}
      {exploredPlaces.map((place) => {
        // Prevent drawing historical marker EXACTLY where the active highlighted marker is
        const isCurrent = marker && marker.position[0] === place.latitude && marker.position[1] === place.longitude;
        if (isCurrent) return null;

        return (
          <Marker 
            key={place.placeKey} 
            position={[place.latitude, place.longitude]}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(place)
            }}
          >
            <Tooltip direction="top" offset={[0, -20]}>
              <div style={{ textAlign: 'center' }}>
                <strong>{place.placeName}</strong><br/>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>Explored</span>
              </div>
            </Tooltip>
          </Marker>
        );
      })}

      {/* Currently Selected Marker (Highlighted) */}
      {marker && (
        <Marker position={marker.position}>
          {marker.label && (
            <Tooltip permanent direction="top" offset={[0, -20]}>
              <strong style={{ color: 'var(--primary-color)' }}>{marker.label}</strong>
            </Tooltip>
          )}
        </Marker>
      )}
    </MapContainer>
  );
}
