import { useState } from 'react';
import { X, Bell, MapPin, Layers, BellOff, Loader2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MODES = [
  { id: 'all', label: 'Todos los reportes', desc: 'Te avisamos de cada reporte nuevo.', icon: Bell },
  { id: 'nearby', label: 'Cerca de mí', desc: 'Urgentes a ≤20 km y normales a ≤5 km de tu ubicación.', icon: MapPin },
  { id: 'zone', label: 'Zona actual', desc: 'Reportes de la zona donde te encuentras.', icon: Layers },
  { id: 'off', label: 'Desactivar', desc: 'No recibir alertas de reportes nuevos.', icon: BellOff },
];

export default function NotificationSettings({ onClose }) {
  const { user, zones, updatePreferences } = useApp();
  const [mode, setMode] = useState(user?.notifyMode || 'nearby');
  const [activeZoneId, setActiveZoneId] = useState(user?.activeZoneId || zones[0]?.id || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updatePreferences(mode === 'zone' ? { notifyMode: mode, activeZoneId } : { notifyMode: mode });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-sky-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-500" /> Alertas de reportes
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sky-50 text-gray-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  active ? 'border-sky-400 bg-sky-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${active ? 'text-sky-700' : 'text-gray-700'}`}>{m.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                </div>
              </button>
            );
          })}

          {mode === 'nearby' && !user?.hasLocation && (
            <p className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Activa el permiso de ubicación en tu navegador para que este modo funcione.
            </p>
          )}

          {mode === 'zone' && (
            <div className="pt-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">¿En qué zona estás?</label>
              <select value={activeZoneId} onChange={(e) => setActiveZoneId(e.target.value)} className="form-select">
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
