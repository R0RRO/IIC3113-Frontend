import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { riskColors, categories } from '../data/mockData';
import { useApp } from '../context/AppContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createZoneIcon = (color) => {
  const colors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;background:${colors[color]};
      border:3px solid white;border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;font-size:14px;
    ">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createReportIcon = (urgent, draggable = false) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:22px;
      background:${urgent ? '#ef4444' : '#0ea5e9'};
      border:2px solid white;border-radius:50%;
      box-shadow:0 1px 5px rgba(0,0,0,0.3);
      ${draggable ? 'cursor:grab;outline:2px solid #fbbf24;outline-offset:2px;' : ''}
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

function jitter(coord, index, total) {
  const angle = (2 * Math.PI * index) / Math.max(total, 1);
  const radius = 0.003 + 0.001 * Math.floor(index / 8);
  return [coord[0] + radius * Math.cos(angle), coord[1] + radius * Math.sin(angle)];
}

function DraggableReportMarker({ report, position, isAdmin, category }) {
  const { updateReport } = useApp();

  return (
    <Marker
      position={position}
      icon={createReportIcon(report.urgent, isAdmin)}
      draggable={isAdmin}
      eventHandlers={isAdmin ? {
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          updateReport(report.id, { coordinates: [lat, lng] });
        },
      } : {}}
    >
      <Popup>
        <div className="max-w-[200px]">
          {report.urgent && <span className="text-xs font-bold text-red-600">⚠ URGENTE — </span>}
          <strong className="text-xs">{report.title}</strong>
          <br />
          <span className="text-xs text-gray-500">{category?.name} · {report.votes} votos</span>
          <br />
          <Link to={`/report/${report.id}`} className="text-xs text-sky-500">Ver reporte →</Link>
          {isAdmin && <p className="text-xs text-amber-500 mt-1">Arrastra para mover</p>}
        </div>
      </Popup>
    </Marker>
  );
}

export default function ZoneMap({ zones, selectedZone, showReports = false, height = '400px' }) {
  const { getZoneReports, userRole } = useApp();
  const isAdmin = userRole === 'admin';

  const center = selectedZone ? selectedZone.coordinates : [-33.01, -71.55];
  const zoom = selectedZone ? 14 : 11;

  return (
    <div className="rounded-xl overflow-hidden border border-sky-100 shadow-sm" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {!showReports && zones.map(zone => (
          <Marker key={`zone-${zone.id}`} position={zone.coordinates} icon={createZoneIcon(zone.riskLevel)}>
            <Popup>
              <div>
                <strong className="text-sm">{zone.name}</strong><br />
                <span className={`text-xs font-semibold ${riskColors[zone.riskLevel].text}`}>
                  Riesgo: {riskColors[zone.riskLevel].label}
                </span><br />
                <Link to={`/zone/${zone.id}`} className="text-xs text-sky-500">Ver zona →</Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {showReports && zones.map(zone => {
          const reports = getZoneReports(zone.id);
          return (
            <LayerGroup key={`reports-${zone.id}`}>
              {reports.map((report, i) => {
                const pos = jitter(zone.coordinates, i, reports.length);
                const category = categories.find(c => c.id === report.category);
                const markerPos = report.coordinates ?? pos;
                return (
                  <DraggableReportMarker
                    key={`report-${report.id}`}
                    report={report}
                    position={markerPos}
                    isAdmin={isAdmin}
                    category={category}
                  />
                );
              })}
            </LayerGroup>
          );
        })}
      </MapContainer>
    </div>
  );
}
