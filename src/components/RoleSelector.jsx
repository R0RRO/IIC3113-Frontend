import { Home, HardHat, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RoleSelector() {
  const { setUserRole } = useApp();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-sky-900/80 backdrop-blur-sm">
      <div className="card-lg w-full max-w-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido a MingUp</h1>
          <p className="text-gray-500 text-sm">¿Cómo participas en la emergencia?</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setUserRole('vecino')}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-sky-200 hover:border-sky-400 hover:bg-sky-50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center group-hover:bg-sky-200 transition-colors">
              <Home className="w-6 h-6 text-sky-600" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">Vecino</p>
              <p className="text-xs text-gray-500 mt-0.5">Reporta necesidades y solicita voluntarios</p>
            </div>
          </button>

          <button
            onClick={() => setUserRole('voluntario')}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <HardHat className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">Voluntario</p>
              <p className="text-xs text-gray-500 mt-0.5">Inscríbete en tareas y coordina ayuda</p>
            </div>
          </button>

          <button
            onClick={() => setUserRole('admin')}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">Admin</p>
              <p className="text-xs text-gray-500 mt-0.5">Gestiona zonas de emergencia</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
