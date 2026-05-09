import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, Home, HardHat, Shield } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const ROLE_CONFIG = {
  vecino:     { label: 'Vecino',     icon: Home,    classes: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
  voluntario: { label: 'Voluntario', icon: HardHat, classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  admin:      { label: 'Admin',      icon: Shield,  classes: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { userRole, setUserRole } = useApp();

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/zones', label: 'Zonas' },
    { to: '/map', label: 'Mapa' },
    ...(userRole === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const role = userRole ? ROLE_CONFIG[userRole] : null;
  const RoleIcon = role?.icon;

  const nextRole = { vecino: 'voluntario', voluntario: 'admin', admin: 'vecino' };

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
            {role && (
              <button
                onClick={() => setUserRole(nextRole[userRole])}
                title="Cambiar rol"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${role.classes}`}
              >
                <RoleIcon className="w-3.5 h-3.5" /> {role.label}
              </button>
            )}
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
            <button
              onClick={() => { setUserRole(nextRole[userRole]); setMenuOpen(false); }}
              className="block w-full text-left px-6 py-3 text-sm font-medium text-gray-500 border-t border-sky-50"
            >
              Cambiar a {ROLE_CONFIG[nextRole[userRole]].label}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
