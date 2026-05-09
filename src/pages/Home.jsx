import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ReportCard from '../components/ReportCard';
import ZoneCard from '../components/ZoneCard';

export default function Home() {
  const { zones, reports } = useApp();

  const topReports = reports.filter(r => !r.completed).sort((a, b) => b.votes - a.votes).slice(0, 5);
  const criticalZones = zones.filter(z => z.riskLevel === 'critical' || z.riskLevel === 'high');
  const totalVolunteers = zones.reduce((sum, z) => sum + z.volunteers, 0);
  const urgentReports = reports.filter(r => r.urgent).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-6 sm:p-10 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 rounded-xl p-3">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">MingUp</h1>
            <p className="text-sky-100 text-sm sm:text-base">Priorización colaborativa para zonas de catástrofe</p>
          </div>
        </div>
        <p className="text-sky-100 max-w-2xl text-sm sm:text-base">
          Reporta necesidades, vota por prioridades y ayuda a coordinar voluntarios
          en zonas de emergencia. Tu voto determina qué se atiende primero.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: MapPin,         label: 'Zonas activas', value: zones.length,    color: 'text-sky-500' },
          { icon: TrendingUp,     label: 'Reportes',      value: reports.length,  color: 'text-blue-500' },
          { icon: AlertTriangle,  label: 'Urgentes',      value: urgentReports,   color: 'text-red-500' },
          { icon: Users,          label: 'Voluntarios',   value: totalVolunteers, color: 'text-green-500' },
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <stat.icon className={`w-6 h-6 mx-auto mb-1 ${stat.color}`} />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Reports */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-heading">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              Reportes con más prioridad
            </h2>
            <Link to="/zones" className="text-sm text-sky-500 hover:text-sky-600 no-underline">
              Ver todas las zonas
            </Link>
          </div>
          <div className="space-y-3">
            {topReports.map(report => (
              <ReportCard key={report.id} report={report} showZone />
            ))}
          </div>
        </div>

        {/* Critical Zones Sidebar */}
        <div className="space-y-3">
          <h2 className="section-heading">
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
