import { Link } from 'react-router-dom';
import { MapPin, Users, FileText } from 'lucide-react';
import { riskColors } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function ZoneCard({ zone }) {
  const risk = riskColors[zone.riskLevel];
  const { getZoneReports } = useApp();
  const reports = getZoneReports(zone.id);

  return (
    <Link to={`/zone/${zone.id}`} className="card-interactive block no-underline group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-sky-100 rounded-lg p-2 group-hover:bg-sky-200 transition-colors">
              <MapPin className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">{zone.name}</h3>
          </div>
          <span className={`badge border ${risk.badge}`}>{risk.label}</span>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{zone.description}</p>

        <div className="meta-row text-sm">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {zone.volunteers} voluntarios
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {reports.length} reportes
          </span>
        </div>
      </div>

      <div className={`h-1 rounded-b-xl ${risk.bg}`} />
    </Link>
  );
}
