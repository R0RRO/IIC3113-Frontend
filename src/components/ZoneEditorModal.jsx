import { useState, useRef } from 'react';
import { X, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { riskColors } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

const RISK_LEVELS = ['critical', 'high', 'medium', 'low'];
const DEFAULT_RADIUS = 3;

const centerIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;
    background:#0ea5e9;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
    cursor:grab;
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function ClickToMove({ onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function ZoneEditorModal({ zone, onClose, onSave }) {
  const isEdit = !!zone;
  const markerRef = useRef(null);

  const [name, setName] = useState(zone?.name ?? '');
  const [description, setDescription] = useState(zone?.description ?? '');
  const [riskLevel, setRiskLevel] = useState(zone?.riskLevel ?? 'medium');
  const [radius, setRadius] = useState(zone?.radiusKm ?? DEFAULT_RADIUS);
  const [center, setCenter] = useState(zone?.coordinates ?? [-33.45, -70.65]);

  const handleDragEnd = () => {
    const latlng = markerRef.current?.getLatLng();
    if (latlng) setCenter([latlng.lat, latlng.lng]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      riskLevel,
      radiusKm: Number(radius),
      coordinates: center,
      volunteers: zone?.volunteers ?? 0,
      activeReports: zone?.activeReports ?? 0,
    });
    onClose();
  };

  const risk = riskColors[riskLevel];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-sky-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            {isEdit ? 'Editar zona' : 'Nueva zona'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sky-50 text-gray-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="form-input"
                placeholder="Ej: Valparaíso Centro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de riesgo</label>
              <div className="flex gap-2 flex-wrap">
                {RISK_LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRiskLevel(level)}
                    className={`badge border cursor-pointer transition-all ${
                      riskLevel === level
                        ? riskColors[level].badge + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                  >
                    {riskColors[level].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="form-textarea"
              placeholder="Describe la situación de la zona..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radio de la zona: <span className="text-sky-600 font-semibold">{radius} km</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={20}
              step={0.5}
              value={radius}
              onChange={e => setRadius(e.target.value)}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0.5 km</span><span>20 km</span>
            </div>
          </div>

          {/* Map */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posición — <span className="text-gray-400 font-normal">arrastra el marcador o haz click en el mapa</span>
            </label>
            <div className="rounded-xl overflow-hidden border border-sky-200" style={{ height: '280px' }}>
              <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickToMove onChange={setCenter} />
                <Circle
                  center={center}
                  radius={Number(radius) * 1000}
                  pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.08, weight: 2 }}
                />
                <Marker
                  position={center}
                  icon={centerIcon}
                  draggable={true}
                  ref={markerRef}
                  eventHandlers={{ dragend: handleDragEnd }}
                />
              </MapContainer>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Centro: {center[0].toFixed(5)}, {center[1].toFixed(5)}
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {isEdit ? 'Guardar cambios' : 'Crear zona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
