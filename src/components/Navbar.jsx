import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, Home, HardHat, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import NotificationBell from './NotificationBell';

const ROLE_CONFIG = {
  vecino:     { label: 'Vecino',     icon: Home,    classes: 'bg-sky-50 text-sky-700 border-sky-200' },
  voluntario: { label: 'Voluntario', icon: HardHat, classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  admin:      { label: 'Admin',      icon: Shield,  classes: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user, userRole, logout } = useApp();

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/zones', label: 'Zonas' },
    { to: '/map', label: 'Mapa' },
    ...(userRole === 'admin' ? [{ to: '/admin', label: 'Admin' }, { to: '/admin/users', label: 'Usuarios' }] : []),
  ];

  const role = userRole ? ROLE_CONFIG[userRole] : null;
  const RoleIcon = role?.icon;

  return (
    <nav className="bg-white border-b border-sky-100 sticky top-0 z-[1001] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="bg-sky-500 rounded-lg p-2">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-sky-900">MingUp</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? 'nav-link-active' : 'nav-link'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            {role && (
              <Link
                to={`/user/${user.id}`}
                title="Mi perfil"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border no-underline hover:opacity-80 transition-opacity ${role.classes}`}
              >
                <RoleIcon className="w-3.5 h-3.5" /> {user?.name || role.label}
              </Link>
            )}
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="hidden sm:flex p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-sky-50"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-sky-100 bg-white">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={location.pathname === link.to ? 'nav-link-mobile-active' : 'nav-link-mobile'}
            >
              {link.label}
            </Link>
          ))}
          {role && (
            <div className="px-6 py-3 border-t border-sky-50 flex items-center justify-between">
              <Link to={`/user/${user.id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 no-underline">
                <RoleIcon className="w-4 h-4" /> {user?.name || role.label}
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-1 text-sm text-red-500 cursor-pointer">
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
