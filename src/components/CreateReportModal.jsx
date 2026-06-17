import { useState, useEffect } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { categories } from '../data/mockData';
import { useApp } from '../context/AppContext';
import 'leaflet/dist/leaflet.css';

const GEO_RADIUS_KM = 5;
const ZONE_RADIUS_KM = 3; // radio del área pintada como zona en el mapa

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

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;
    background:#0ea5e9;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function ClickHandler({ zoneCenter, radiusKm, onPlace }) {
  useMapEvents({
    click(e) {
      const clicked = [e.latlng.lat, e.latlng.lng];
      const dist = haversineKm(zoneCenter, clicked);
      if (dist <= radiusKm) {
        onPlace(clicked);
      }
    },
  });
  return null;
}

export default function CreateReportModal({ zoneId, onClose, zoneCoordinates, zoneRadiusKm }) {
  const { addReport, userRole, enrollReport } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('rescue');
  const [urgent, setUrgent] = useState(false);
  const [volunteersNeeded, setVolunteersNeeded] = useState(0);
  const [pinCoords, setPinCoords] = useState(null);
  const [pinError, setPinError] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('loading');

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(c);
        setGeoStatus('ok');
      },
      () => setGeoStatus('denied'),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);


  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pinCoords) { setPinError(true); return; }
    setPinError(false);
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const newId = await addReport({ zoneId, title, description, category, urgent, coordinates: pinCoords, volunteersNeeded: Number(volunteersNeeded), enrolledCount: 0 });
      if (userRole === 'voluntario' && Number(volunteersNeeded) > 0) {
        await enrollReport(newId);
      }
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-sky-100">
          <h2 className="text-lg font-bold text-gray-900">Nuevo Reporte</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sky-50 text-gray-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Describe brevemente la situación..."
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="form-select"
            >
              {categories.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalla la situación, necesidades y cualquier información relevante..."
              rows={3}
              className="form-textarea"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voluntarios necesarios
            </label>
            <input
              type="number"
              min={0}
              max={30}
              value={volunteersNeeded}
              onChange={e => setVolunteersNeeded(e.target.value)}
              className="form-input w-32"
            />
            <p className="text-xs text-gray-400 mt-1">Deja en 0 si no se necesitan voluntarios</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setUrgent(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${urgent ? 'bg-red-500' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${urgent ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Marcar como urgente</span>
              <p className="text-xs text-gray-400">Requiere atención inmediata</p>
            </div>
          </label>

          {/* Map pin selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-sm font-medium flex items-center gap-1.5 ${pinError ? 'text-red-500' : 'text-gray-700'}`}>
                <MapPin className={`w-4 h-4 ${pinError ? 'text-red-500' : 'text-sky-500'}`} />
                Ubicación del incidente {pinError && <span className="text-xs">(obligatorio)</span>}
              </label>
              {geoStatus === 'loading' && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Obteniendo GPS...
                </span>
              )}
              {pinCoords && (
                <button
                  type="button"
                  onClick={() => setPinCoords(null)}
                  className="text-xs text-red-400 hover:text-red-500 cursor-pointer"
                >
                  Quitar pin
                </button>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-sky-200" style={{ height: '200px' }}>
              <MapContainer
                center={zoneCoordinates}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickHandler
                  zoneCenter={zoneCoordinates}
                  radiusKm={zoneRadiusKm || ZONE_RADIUS_KM}
                  onPlace={(c) => { setPinCoords(c); setPinError(false); }}
                />
                <Circle
                  center={zoneCoordinates}
                  radius={(zoneRadiusKm || ZONE_RADIUS_KM) * 1000}
                  pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.08, weight: 2, dashArray: '6 4' }}
                />
                {pinCoords && (
                  <Marker position={pinCoords} icon={pinIcon} />
                )}
              </MapContainer>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {pinCoords
                ? `Pin en ${pinCoords[0].toFixed(5)}, ${pinCoords[1].toFixed(5)}`
                : 'Haz click dentro del área de la zona para colocar el pin'}
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {submitting ? 'Publicando...' : 'Publicar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
