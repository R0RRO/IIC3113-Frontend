import { useState } from 'react';
import { MapPin, Home, HardHat, Shield, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROLES = [
  { id: 'vecino', label: 'Vecino', icon: Home, desc: 'Reporta necesidades', color: 'sky' },
  { id: 'voluntario', label: 'Voluntario', icon: HardHat, desc: 'Coordina ayuda', color: 'emerald' },
  { id: 'admin', label: 'Admin', icon: Shield, desc: 'Gestiona zonas', color: 'amber' },
];

const RING = {
  sky: 'border-sky-400 bg-sky-50 text-sky-700',
  emerald: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-400 bg-amber-50 text-amber-700',
};

export default function AuthScreen() {
  const { login, register } = useApp();
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('vecino');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register({ email, password, name, role });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-sky-900/80 backdrop-blur-sm">
      <div className="card-lg w-full max-w-md shadow-2xl p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-sky-500 rounded-lg p-2">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-sky-900">MingUp</span>
        </div>

        <div className="flex border-b border-sky-100 mb-6">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                mode === m ? 'text-sky-600 border-b-2 border-sky-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {m === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="form-input" placeholder="Tu nombre" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="tu@email.cl" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="form-input" placeholder="Mínimo 6 caracteres" />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo participas?</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        active ? RING[r.color] : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
