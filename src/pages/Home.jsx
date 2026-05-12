import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ReportCard from '../components/ReportCard';
import ZoneCard from '../components/ZoneCard';

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

export default function Home() {
  const { zones, reports, getZone } = useApp();
  const [tab, setTab] = useState('reports');
  const [userCoords, setUserCoords] = useState(null);
  const [geoAvailable, setGeoAvailable] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setGeoAvailable(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserCoords([pos.coords.latitude, pos.coords.longitude]); setGeoAvailable(true); },
      () => setGeoAvailable(true),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const canVoteReport = useCallback((report) => {
    if (!geoAvailable) return false;
    if (!userCoords) return true; // geo unavailable/denied → allow
    const zone = getZone(report.zoneId);
    if (!zone) return false;
    const dist = haversineKm(userCoords, zone.coordinates);
    return dist <= (zone.radiusKm ?? 5);
  }, [userCoords, geoAvailable, getZone]);

  const urgentReportsList = reports.filter(r => !r.completed && r.urgent).sort((a, b) => b.votes - a.votes).slice(0, 5);
  const criticalZones = zones.filter(z => z.riskLevel === 'critical' || z.riskLevel === 'high');
  const totalVolunteers = zones.reduce((sum, z) => sum + z.volunteers, 0);
  const urgentReports = reports.filter(r => r.urgent).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-4 sm:p-10 text-white">
        <div className="flex items-center gap-3 mb-2 sm:mb-4">
          <div className="bg-white/20 rounded-xl p-2 sm:p-3">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-4xl font-bold">MingUp</h1>
            <p className="text-sky-100 text-xs sm:text-base">Priorización colaborativa para zonas de catástrofe</p>
          </div>
        </div>
        <p className="text-sky-100 max-w-2xl text-xs sm:text-base hidden sm:block">
          Reporta necesidades, vota por prioridades y ayuda a coordinar voluntarios
          en tu zona de emergencia. Tu voto determina qué se atiende primero.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { icon: MapPin,         label: 'Zonas',      value: zones.length,    color: 'text-sky-500' },
          { icon: TrendingUp,     label: 'Reportes',   value: reports.length,  color: 'text-blue-500' },
          { icon: AlertTriangle,  label: 'Urgentes',   value: urgentReports,   color: 'text-red-500' },
          { icon: Users,          label: 'Voluntarios',value: totalVolunteers, color: 'text-green-500' },
        ].map(stat => (
          <div key={stat.label} className="card p-2 sm:p-4 text-center">
            <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 ${stat.color}`} />
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mobile tabs */}
      <div className="flex lg:hidden border-b border-sky-100">
        <button
          onClick={() => setTab('reports')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${tab === 'reports' ? 'text-sky-600 border-b-2 border-sky-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-1.5" />Reportes urgentes
        </button>
        <button
          onClick={() => setTab('zones')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${tab === 'zones' ? 'text-sky-600 border-b-2 border-sky-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <MapPin className="w-4 h-4 inline mr-1.5" />Zonas críticas
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Reports */}
        <div className={`lg:col-span-2 space-y-3 ${tab === 'zones' ? 'hidden lg:block' : ''}`}>
          <div className="hidden lg:flex items-center justify-between">
            <h2 className="section-heading">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Reportes urgentes
            </h2>
            <Link to="/zones" className="text-sm text-sky-500 hover:text-sky-600 no-underline">
              Ver todas las zonas
            </Link>
          </div>
          <div className="space-y-3">
            {urgentReportsList.map(report => (
              <ReportCard key={report.id} report={report} showZone voteDisabled={!canVoteReport(report)} />
            ))}
          </div>
        </div>

        {/* Critical Zones Sidebar */}
        <div className={`space-y-3 ${tab === 'reports' ? 'hidden lg:block' : ''}`}>
          <h2 className="hidden lg:flex section-heading">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Zonas críticas
          </h2>
          <div className="space-y-3">
            {criticalZones.map(zone => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
          <Link
            to="/zones"
            className="block text-center py-3 card border-sky-200 text-sm font-medium text-sky-600 hover:bg-sky-50 no-underline transition-colors"
          >
            Ver todas las zonas
          </Link>
        </div>
      </div>
    </div>
  );
}
