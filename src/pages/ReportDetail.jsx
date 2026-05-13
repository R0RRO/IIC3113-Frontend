import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Clock, MessageCircle, User, AlertTriangle, HardHat, Users, CheckCircle, Trash2, Pencil, X, Flag, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { useNearZone } from '../hooks/useNearZone';
import { categories, riskColors } from '../data/mockData';
import VoteButton from '../components/VoteButton';

const reportPinIcon = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;background:#0ea5e9;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'hace menos de 1 hora';
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export default function ReportDetail() {
  const { reportId } = useParams();
  const { reports, getZone, userRole, enrolledReports, enrollReport, deleteReport, updateReport, userCompletions, voteComplete, unvoteComplete } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUrgent, setEditUrgent] = useState(false);
  const [editVolunteers, setEditVolunteers] = useState(0);

  const report = reports.find(r => r.id === parseInt(reportId));
  if (!report) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Reporte no encontrado</p>
        <Link to="/" className="text-sky-500 mt-2 inline-block">← Volver al inicio</Link>
      </div>
    );
  }

  const zone = getZone(report.zoneId);
  const zoneRadius = zone?.radiusKm ?? 5;
  const { status: geoStatus } = useNearZone(zone?.coordinates ?? [-33.01, -71.55], zoneRadius);
  const canVote = geoStatus === 'near';
  const category = categories.find(c => c.id === report.category);
  const risk = zone ? riskColors[zone.riskLevel] : null;
  const isEnrolled = enrolledReports.has(report.id);
  const hasSlots = report.volunteersNeeded > 0;
  const threshold = Math.ceil((report.enrolledCount || 0) / 2);
  const canComplete = userRole === 'voluntario' && isEnrolled && !report.completed && !userCompletions.has(report.id) && threshold > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/zone/${report.zoneId}`} className="back-link">
          <ArrowLeft className="w-4 h-4" /> Volver a {zone?.name || 'zona'}
        </Link>
        {userRole === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditTitle(report.title); setEditDescription(report.description); setEditUrgent(report.urgent); setEditVolunteers(report.volunteersNeeded ?? 0); setEditing(v => !v); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer border border-amber-200"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              onClick={() => { deleteReport(report.id); navigate(`/zone/${report.zoneId}`); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar reporte
            </button>
          </div>
        )}
      </div>

      <div className="card-lg p-5 sm:p-8">
        <div className="flex gap-4">
          <VoteButton report={report} disabled={!canVote} />

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {report.authorRole === 'voluntario' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <HardHat className="w-3 h-3" /> Voluntario
                </span>
              )}
              {report.urgent && (
                <span className="badge-urgent">
                  <AlertTriangle className="w-3 h-3" />
                  Urgente
                </span>
              )}
              {category && (
                <span className={`badge ${category.color}`}>{category.name}</span>
              )}
              {zone && risk && (
                <Link to={`/zone/${zone.id}`} className={`badge border no-underline ${risk.badge}`}>
                  {zone.name}
                </Link>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{report.title}</h1>

            <div className="meta-row text-sm">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {report.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {timeAgo(report.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {report.comments} comentarios
              </span>
            </div>

            <div className="border-t border-sky-100 pt-4">
              <p className="text-gray-700 leading-relaxed">{report.description}</p>
            </div>

            {editing && (
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                <p className="text-xs font-semibold text-amber-700">Editar reporte</p>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  placeholder="Título"
                />
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
                  placeholder="Descripción"
                />
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
                    <div
                      onClick={() => setEditUrgent(v => !v)}
                      className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ${editUrgent ? 'bg-red-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${editUrgent ? 'translate-x-3' : 'translate-x-0'}`} />
                    </div>
                    Urgente
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Users className="w-4 h-4 text-sky-500" />
                    Voluntarios necesarios:
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={editVolunteers}
                      onChange={e => setEditVolunteers(e.target.value)}
                      max={30}
                    className="w-20 px-2 py-1 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { updateReport(report.id, { title: editTitle, description: editDescription, urgent: editUrgent, volunteersNeeded: Number(editVolunteers) }); setEditing(false); }}
                    className="px-4 py-1.5 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location map */}
      {(() => {
        const coords = report.coordinates ?? zone?.coordinates;
        if (!coords) return null;
        const gmUrl = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
        return (
          <div className="card-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="section-heading">
                <MapPin className="w-5 h-5 text-sky-500" /> Ubicación
              </h2>
              <a href={gmUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-sky-500 hover:text-sky-600 no-underline font-medium">
                Abrir en Google Maps →
              </a>
            </div>
            <div style={{ height: '220px' }}>
              <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coords} icon={reportPinIcon}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold">{report.title}</p>
                      <a href={gmUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sky-500 no-underline">
                        Abrir en Google Maps →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        );
      })()}

      {/* Volunteer enrollment */}
      {hasSlots && (
        <div className="card-lg p-5 sm:p-6">
          <h2 className="section-heading mb-4">
            <Users className="w-5 h-5 text-sky-500" />
            Voluntarios necesarios
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-sky-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-sky-600">{report.enrolledCount}</div>
              <div className="text-xs text-gray-500 mt-1">inscritos</div>
            </div>
            <div className="text-gray-300 text-2xl">/</div>
            <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-700">{report.volunteersNeeded}</div>
              <div className="text-xs text-gray-500 mt-1">necesarios</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (report.enrolledCount / report.volunteersNeeded) * 100)}%` }}
            />
          </div>

          {userRole === 'voluntario' ? (
            <div className="space-y-2">
              <button
                onClick={() => enrollReport(report.id)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                  isEnrolled
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {isEnrolled ? 'Inscrito — click para cancelar' : 'Inscribirse como voluntario'}
              </button>
              {isEnrolled && !report.completed && threshold > 0 && (
                userCompletions.has(report.id) ? (
                  <div className="space-y-1">
                    <p className="text-center text-xs text-emerald-600 font-medium">
                      ✓ Confirmaste — {threshold - (report.completionVotes || 0)} confirmaciones más para resolver
                    </p>
                    <button
                      onClick={() => unvoteComplete(report.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm bg-emerald-100 text-emerald-700 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer border border-emerald-200"
                    >
                      <X className="w-4 h-4" /> Cancelar confirmación
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => voteComplete(report.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    <Flag className="w-4 h-4" /> Completado ({report.completionVotes || 0}/{threshold})
                  </button>
                )
              )}
              {hasSlots && !isEnrolled && !report.completed && (
                <p className="text-center text-xs text-gray-400">
                  Solo voluntarios inscritos pueden confirmar como completado
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400">
              Solo voluntarios pueden inscribirse en esta tarea.
            </p>
          )}
        </div>
      )}

      {/* Comments placeholder */}
      <div className="card-lg p-5 sm:p-6">
        <h2 className="section-heading mb-4">
          <MessageCircle className="w-5 h-5 text-sky-500" />
          Comentarios ({report.comments})
        </h2>
        <div className="space-y-4">
          <textarea
            placeholder="Agrega un comentario con información o actualizaciones..."
            rows={3}
            className="form-textarea"
          />
          <button className="btn-primary">Comentar</button>
        </div>
        <div className="mt-6 text-center py-8 text-gray-400 text-sm">
          Los comentarios se mostrarán aquí cuando se conecte el backend.
        </div>
      </div>
    </div>
  );
}
