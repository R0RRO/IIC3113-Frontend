import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Home, HardHat, Shield, Briefcase, Loader2, Ban, CheckCircle, FileText, Calendar, Pencil, X } from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { categories } from '../data/mockData';
import ReportCard from '../components/ReportCard';

const ROLE = {
  vecino: { label: 'Vecino', icon: Home, badge: 'bg-sky-100 text-sky-700 border-sky-200', iconBg: 'bg-sky-100 text-sky-600' },
  voluntario: { label: 'Voluntario', icon: HardHat, badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', iconBg: 'bg-emerald-100 text-emerald-600' },
  admin: { label: 'Admin', icon: Shield, badge: 'bg-amber-100 text-amber-700 border-amber-200', iconBg: 'bg-amber-100 text-amber-600' },
};

export default function Profile() {
  const { userId } = useParams();
  const { userRole, reports, user, updateProfile } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', preferredArea: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getUser(userId)
      .then((p) => { if (active) setProfile(p); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const toggleSuspend = async () => {
    setBusy(true);
    try {
      const r = await api.suspendUser(userId, !profile.suspended);
      setProfile((p) => ({ ...p, suspended: r.suspended }));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = () => {
    setForm({ name: profile.name, bio: profile.bio || '', preferredArea: profile.preferredArea || '' });
    setEditing(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const u = await updateProfile({
        name: form.name.trim(),
        bio: form.bio.trim() || null,
        preferredArea: form.preferredArea || null,
      });
      setProfile((p) => ({ ...p, name: u.name, bio: u.bio, preferredArea: u.preferredArea }));
      setEditing(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Usuario no encontrado</p>
        <Link to="/" className="text-sky-500 mt-2 inline-block">← Volver al inicio</Link>
      </div>
    );
  }

  const role = ROLE[profile.role] || ROLE.vecino;
  const RoleIcon = role.icon;
  const userReports = reports.filter((r) => r.authorId === userId);
  const joined = new Date(profile.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
  const areaName = categories.find((c) => c.id === profile.preferredArea)?.name || profile.preferredArea;
  const isOwn = user?.id === profile.id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Link to="/" className="back-link"><ArrowLeft className="w-4 h-4" /> Volver</Link>

      <div className="card-lg p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${role.iconBg}`}>
            <RoleIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name}</h1>
              <span className={`badge border ${role.badge}`}>{role.label}</span>
              {profile.suspended && (
                <span className="badge border bg-red-100 text-red-700 border-red-200">Suspendido</span>
              )}
            </div>
            <div className="meta-row text-sm mt-2 flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Desde {joined}</span>
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {profile.reportCount} reportes</span>
              {profile.preferredArea && (
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {areaName}</span>
              )}
            </div>
          </div>

          {isOwn && !editing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-sky-200 text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar perfil
            </button>
          )}

          {userRole === 'admin' && !isOwn && profile.role !== 'admin' && (
            <button
              onClick={toggleSuspend}
              disabled={busy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer disabled:opacity-60 ${
                profile.suspended
                  ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                  : 'text-red-500 border-red-200 hover:bg-red-50'
              }`}
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : profile.suspended ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
              {profile.suspended ? 'Reactivar' : 'Suspender'}
            </button>
          )}
        </div>

        {!editing && profile.bio && (
          <p className="text-gray-600 text-sm mt-4 pt-4 border-t border-sky-50 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        )}

        {editing && (
          <div className="mt-4 pt-4 border-t border-sky-50 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="form-input" />
            </div>
            {profile.role === 'voluntario' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Área de desempeño</label>
                <select value={form.preferredArea} onChange={(e) => setForm((f) => ({ ...f, preferredArea: e.target.value }))} className="form-select">
                  <option value="">Sin preferencia</option>
                  {categories.filter((c) => c.id !== 'all' && c.id !== 'volunteers').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} className="form-textarea" maxLength={500} placeholder="Tu experiencia, habilidades..." />
            </div>
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-1"><X className="w-4 h-4" /> Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="section-heading mb-3"><FileText className="w-5 h-5 text-sky-500" /> Reportes de {profile.name}</h2>
        <div className="space-y-3">
          {userReports.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">Sin reportes</p>
          ) : (
            userReports.map((r) => <ReportCard key={r.id} report={r} showZone />)
          )}
        </div>
      </div>
    </div>
  );
}
