import { useState } from 'react';
import { Plus, Pencil, Trash2, Shield, Users, FileText, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { riskColors } from '../data/mockData';
import ZoneEditorModal from '../components/ZoneEditorModal';

export default function AdminPanel() {
  const { zones, reports, addZone, updateZone, deleteZone } = useApp();
  const [editingZone, setEditingZone] = useState(null); // zone object or 'new'
  const [confirmDelete, setConfirmDelete] = useState(null); // zone id

  const getReportCount = (zoneId) => reports.filter(r => r.zoneId === zoneId).length;

  const handleSave = (data) => {
    if (editingZone === 'new') {
      addZone(data);
    } else {
      updateZone(editingZone.id, data);
    }
    setEditingZone(null);
  };

  return (
    <div className="page-layout">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="page-header-icon bg-amber-100">
            <Shield className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-500 text-sm">Gestiona zonas de emergencia</p>
          </div>
        </div>
        <button onClick={() => setEditingZone('new')} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva zona
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Zonas activas', value: zones.length, icon: Shield, color: 'text-amber-500' },
          { label: 'Total reportes', value: reports.length, icon: FileText, color: 'text-sky-500' },
          { label: 'Urgentes', value: reports.filter(r => r.urgent).length, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Voluntarios', value: zones.reduce((s, z) => s + (z.volunteers || 0), 0), icon: Users, color: 'text-green-500' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Zone list */}
      <div className="space-y-3">
        {zones.map(zone => {
          const risk = riskColors[zone.riskLevel];
          const reportCount = getReportCount(zone.id);
          return (
            <div key={zone.id} className="card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900">{zone.name}</h3>
                    <span className={`badge border ${risk.badge}`}>{risk.label}</span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-2">{zone.description}</p>
                  <div className="meta-row text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {zone.volunteers ?? 0} voluntarios
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {reportCount} reportes
                    </span>
                    <span className="text-gray-300 text-xs">
                      {zone.coordinates[0].toFixed(4)}, {zone.coordinates[1].toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditingZone(zone)}
                    className="p-2 rounded-lg text-sky-500 hover:bg-sky-50 transition-colors cursor-pointer"
                    title="Editar zona"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(zone)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar zona"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone editor modal */}
      {editingZone && (
        <ZoneEditorModal
          zone={editingZone === 'new' ? null : editingZone}
          onClose={() => setEditingZone(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40">
          <div className="card-lg w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900">Eliminar zona</h3>
            </div>
            <p className="text-gray-500 text-sm mb-1">
              ¿Eliminar <strong>{confirmDelete.name}</strong>?
            </p>
            <p className="text-red-500 text-xs mb-5">
              Se eliminarán también todos sus reportes ({getReportCount(confirmDelete.id)}).
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={() => { deleteZone(confirmDelete.id); setConfirmDelete(null); }}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
