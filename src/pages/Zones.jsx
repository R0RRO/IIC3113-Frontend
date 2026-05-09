import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ZoneCard from '../components/ZoneCard';

export default function Zones() {
  const { zones } = useApp();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const filtered = zones.filter(z => {
    const matchesSearch = z.name.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'all' || z.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const riskLabels = { all: 'Todos', critical: 'Crítico', high: 'Alto', medium: 'Medio', low: 'Bajo' };

  return (
    <div className="page-layout">
      <div className="flex items-center gap-3">
        <div className="page-header-icon">
          <MapPin className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zonas de Emergencia</h1>
          <p className="text-gray-500 text-sm">Selecciona una zona para ver reportes y coordinar ayuda</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar zona..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input-search"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'critical', 'high', 'medium', 'low'].map(level => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={riskFilter === level ? 'btn-filter-active' : 'btn-filter'}
            >
              {riskLabels[level]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(zone => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No se encontraron zonas</p>
        </div>
      )}
    </div>
  );
}
