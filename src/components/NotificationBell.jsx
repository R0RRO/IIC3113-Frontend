import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export default function NotificationBell() {
  const { notifications, unread, markNotifRead, markAllRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-sky-100 overflow-hidden z-[1002]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-sky-50">
            <span className="font-semibold text-sm text-gray-900">Notificaciones</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-sky-500 hover:text-sky-600 flex items-center gap-1 cursor-pointer">
                <Check className="w-3 h-3" /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Sin notificaciones
              </div>
            ) : (
              notifications.map((n) => {
                const inner = (
                  <div className={`px-4 py-3 border-b border-sky-50 transition-colors hover:bg-sky-50 ${n.read ? '' : 'bg-sky-50/60'}`}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-sky-500 shrink-0" />}
                      <div className={n.read ? 'pl-4' : ''}>
                        <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
                const onClick = () => { if (!n.read) markNotifRead(n.id); setOpen(false); };
                return n.reportId ? (
                  <Link key={n.id} to={`/report/${n.reportId}`} onClick={onClick} className="block no-underline">
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id} onClick={onClick} className="cursor-pointer">{inner}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
