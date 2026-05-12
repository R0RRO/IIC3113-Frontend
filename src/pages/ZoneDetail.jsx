import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Users, FileText, SlidersHorizontal, MapPin, Loader2, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { riskColors, categories } from '../data/mockData';
import { useNearZone } from '../hooks/useNearZone';
import ReportCard from '../components/ReportCard';
import ZoneMap from '../components/ZoneMap';
import CreateReportModal from '../components/CreateReportModal';

const GEO_RADIUS_KM = 5;

function GeoStatusBadge({ status, distanceKm, radiusKm }) {
  if (status === 'loading') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando ubicación...
    </span>
  );
  if (status === 'near') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
      <MapPin className="w-3.5 h-3.5" /> Estás en la zona ({distanceKm} km)
    </span>
  );
  if (status === 'far') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-orange-500 font-medium">
      <ShieldAlert className="w-3.5 h-3.5" /> Fuera de zona ({distanceKm} km — límite {radiusKm} km)
    </span>
  );
  if (status === 'denied') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-red-500 font-medium">
      <ShieldAlert className="w-3.5 h-3.5" /> Permiso de ubicación denegado
    </span>
  );
  return null;
}

export default function ZoneDetail() {
  const { zoneId } = useParams();
  const { getZone, getZoneReports } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [sortBy, setSortBy] = useState('votes');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const zone = getZone(zoneId);
  const reports = getZoneReports(zoneId);
  const zoneRadius = zone?.radiusKm ?? GEO_RADIUS_KM;
  const { status: geoStatus, distanceKm } = useNearZone(
    zone?.coordinates ?? [-33.01, -71.55],
    zoneRadius
  );

  const canPost = geoStatus === 'near' || geoStatus === 'unavailable';

  const filteredReports = useMemo(() => {
    let result = reports.filter(r => !r.completed);
    if (categoryFilter !== 'all') result = result.filter(r => r.category === categoryFilter);
    if (sortBy === 'votes') return result.sort((a, b) => b.votes - a.votes);
    if (sortBy === 'recent') return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'volunteers') {
      return result.sort((a, b) => {
        const pctA = a.volunteersNeeded > 0 ? (a.enrolledCount || 0) / a.volunteersNeeded : 1;
        const pctB = b.volunteersNeeded > 0 ? (b.enrolledCount || 0) / b.volunteersNeeded : 1;
        return pctA - pctB;
      });
    }
    return result;
  }, [reports, sortBy, categoryFilter]);

  if (!zone) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <p className="text-gray-500">Zona no encontrada</p>
      <Link to="/zones" className="text-sky-500 mt-2 inline-block">← Volver a zonas</Link>
    </div>
  );

  const risk = riskColors[zone.riskLevel];

  return (
    <div className="page-layout">
      <div>
        <Link to="/zones" className="back-link mb-3 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Volver a zonas
        </Link>

        <div className="card-lg p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{zone.name}</h1>
                <span className={`badge border ${risk.badge}`}>{risk.label}</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xl">{zone.description}</p>
              <div className="meta-row text-sm mt-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {zone.volunteers} voluntarios
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" /> {reports.length} reportes
                </span>
                <GeoStatusBadge status={geoStatus} distanceKm={distanceKm} radiusKm={zoneRadius} />
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={() => canPost && setShowCreate(true)}
                disabled={!canPost}
                title={
                  geoStatus === 'far'    ? `Debes estar a menos de ${zoneRadius} km` :
                  geoStatus === 'denied' ? 'Permite el acceso a tu ubicación para publicar' :
                  geoStatus === 'loading'? 'Verificando ubicación...' : ''
                }
                className={canPost
                  ? 'btn-primary'
                  : 'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed whitespace-nowrap'
                }
              >
                <Plus className="w-4 h-4" /> Nuevo Reporte
              </button>
              {(geoStatus === 'far' || geoStatus === 'denied') && (
                <p className="text-xs text-gray-400 text-right max-w-[200px]">
                  {geoStatus === 'far' ? 'Solo voluntarios en la zona pueden reportar' : 'Activa ubicación en tu navegador'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ZoneMap zones={[zone]} selectedZone={zone} showReports={true} height="280px" />

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={categoryFilter === cat.id ? 'btn-filter-active' : 'btn-filter'}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="form-select w-auto"
          >
            <option value="votes">Mayor prioridad</option>
            <option value="recent">Más reciente</option>
            <option value="volunteers">Menos voluntarios cubiertos</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredReports.map(report => (
          <ReportCard key={report.id} report={report} />
        ))}
        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay reportes en esta categoría</p>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateReportModal zoneId={zoneId} zoneCoordinates={zone.coordinates} zoneRadiusKm={zone.radiusKm} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
