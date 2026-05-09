import { useState, useEffect } from 'react';

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// status: 'idle' | 'loading' | 'near' | 'far' | 'denied' | 'unavailable'
export function useNearZone(zoneCoordinates, radiusKm = 5) {
  const [status, setStatus] = useState('idle');
  const [distanceKm, setDistanceKm] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords = [pos.coords.latitude, pos.coords.longitude];
        const dist = haversineKm(userCoords, zoneCoordinates);
        setDistanceKm(Math.round(dist * 10) / 10);
        setStatus(dist <= radiusKm ? 'near' : 'far');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('unavailable');
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [zoneCoordinates, radiusKm]);

  return { status, distanceKm };
}
