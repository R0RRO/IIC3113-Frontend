import { MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ZoneMap from '../components/ZoneMap';

export default function MapView() {
  const { zones } = useApp();

  return (
    <div className="page-layout">
      <div className="flex items-center gap-3">
        <div className="page-header-icon">
          <MapPin className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapa de Eventos</h1>
          <p className="text-gray-500 text-sm">Cada marcador representa un reporte activo en su zona</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
        <span className="font-medium text-gray-700 w-full sm:w-auto">Zonas:</span>
        {[
          { color: 'bg-red-500',    label: 'Crítico' },
          { color: 'bg-orange-500', label: 'Alto' },
          { color: 'bg-yellow-500', label: 'Medio' },
          { color: 'bg-green-500',  label: 'Bajo' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            {item.label}
          </div>
        ))}
        <span className="hidden sm:block text-gray-300">|</span>
        <span className="font-medium text-gray-700 w-full sm:w-auto">Reportes:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" /> Urgente
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-sky-500" /> Normal
        </div>
      </div>

      <ZoneMap zones={zones} showReports={true} height="calc(100vh - 270px)" />
    </div>
  );
}
