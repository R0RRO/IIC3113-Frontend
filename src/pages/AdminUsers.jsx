import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, HardHat, Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';

const ROLE = {
  vecino: { label: 'Vecino', icon: Home, badge: 'bg-sky-100 text-sky-700 border-sky-200' },
  voluntario: { label: 'Voluntario', icon: HardHat, badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  admin: { label: 'Admin', icon: Shield, badge: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export default function AdminUsers() {
  const { userRole } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api.listUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (userRole !== 'admin') {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">Solo administradores.</div>;
  }

  const toggle = async (u) => {
    setBusyId(u.id);
    try {
      const r = await api.suspendUser(u.id, !u.suspended);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, suspended: r.suspended } : x)));
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-layout">
      <div className="flex items-center gap-3">
        <div className="page-header-icon bg-amber-100">
          <Users className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm">Gestiona cuentas y suspende usuarios</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-sky-400 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const role = ROLE[u.role] || ROLE.vecino;
            const RoleIcon = role.icon;
            return (
              <div key={u.id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <RoleIcon className="w-5 h-5 text-sky-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/user/${u.id}`} className="font-semibold text-gray-900 hover:text-sky-600 no-underline truncate">{u.name}</Link>
                    <span className={`badge border ${role.badge}`}>{role.label}</span>
                    {u.suspended && <span className="badge border bg-red-100 text-red-700 border-red-200">Suspendido</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => toggle(u)}
                    disabled={busyId === u.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer disabled:opacity-60 shrink-0 ${
                      u.suspended
                        ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        : 'text-red-500 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    {busyId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : u.suspended ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                    {u.suspended ? 'Reactivar' : 'Suspender'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
