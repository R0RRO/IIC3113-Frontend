import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Clock, AlertTriangle, HardHat, Users, CheckCircle, Trash2, Pencil, X, Flag } from 'lucide-react';
import { categories } from '../data/mockData';
import { useApp } from '../context/AppContext';
import VoteButton from './VoteButton';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'hace menos de 1 hora';
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export default function ReportCard({ report, showZone = false, voteDisabled = false }) {
  const category = categories.find(c => c.id === report.category);
  const { userRole, enrolledReports, enrollReport, deleteReport, updateReport, userCompletions, voteComplete, unvoteComplete } = useApp();
  const isEnrolled = enrolledReports.has(report.id);
  const hasSlots = report.volunteersNeeded > 0;
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(report.title);
  const [editDescription, setEditDescription] = useState(report.description);
  const [editUrgent, setEditUrgent] = useState(report.urgent);
  const [editVolunteers, setEditVolunteers] = useState(report.volunteersNeeded ?? 0);
  const [editingVol, setEditingVol] = useState(false);
  const [editVolVal, setEditVolVal] = useState(report.volunteersNeeded ?? 0);
  const threshold = Math.ceil((report.enrolledCount || 0) / 2);
  const canComplete = userRole === 'voluntario' && isEnrolled && !report.completed && !userCompletions.has(report.id) && threshold > 0;

  const saveEdit = () => {
    updateReport(report.id, { title: editTitle, description: editDescription, urgent: editUrgent, volunteersNeeded: Number(editVolunteers) });
    setEditing(false);
  };

  return (
    <div className="card hover:border-sky-200 transition-all hover:shadow-md relative group/card overflow-hidden">
      {userRole === 'admin' && !editing && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <button
            onClick={() => { setEditTitle(report.title); setEditDescription(report.description); setEditUrgent(report.urgent); setEditVolunteers(report.volunteersNeeded ?? 0); setEditing(true); }}
            className="p-1.5 rounded-lg text-gray-300 hover:text-sky-500 hover:bg-sky-50 transition-colors cursor-pointer"
            title="Editar reporte"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteReport(report.id)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Eliminar reporte"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex gap-3 p-3 sm:p-4 min-w-0">
        <VoteButton report={report} disabled={voteDisabled} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            {report.authorRole === 'voluntario' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <HardHat className="w-3 h-3" /> Voluntario
              </span>
            )}
            {report.urgent && (
              <span className="badge-urgent">
                <AlertTriangle className="w-3 h-3" /> Urgente
              </span>
            )}
            {category && (
              <span className={`badge ${category.color}`}>{category.name}</span>
            )}
          </div>

          <Link
            to={`/report/${report.id}`}
            className="text-gray-900 font-semibold text-sm sm:text-base hover:text-sky-600 no-underline leading-snug block"
          >
            {report.title}
          </Link>

          <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">{report.description}</p>

          {/* Admin inline editor */}
          {editing && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-2 py-1.5 border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                placeholder="Título"
              />
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={2}
                className="w-full px-2 py-1.5 border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
                placeholder="Descripción"
              />
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-700">
                  <div
                    onClick={() => setEditUrgent(v => !v)}
                    className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ${editUrgent ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${editUrgent ? 'translate-x-3' : 'translate-x-0'}`} />
                  </div>
                  Urgente
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <Users className="w-3.5 h-3.5 text-sky-500" />
                  Voluntarios:
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={editVolunteers}
                    onChange={e => setEditVolunteers(e.target.value)}
                    className="w-16 px-2 py-1 border border-sky-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="px-3 py-1 bg-sky-500 text-white rounded-lg text-xs font-medium hover:bg-sky-600 cursor-pointer">
                  Guardar
                </button>
                <button onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 cursor-pointer flex items-center gap-1">
                  <X className="w-3 h-3" /> Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
            <div className="meta-row">
              <span>{report.author}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(report.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> {report.comments}
              </span>
              {hasSlots && (
                <span className="flex items-center gap-1 text-sky-500">
                  <Users className="w-3 h-3" />
                  {editingVol ? (
                    <>
                      <input
                        type="number" min={0} max={30} value={editVolVal}
                        onChange={e => setEditVolVal(e.target.value)}
                        className="w-12 px-1 border border-sky-300 rounded text-xs focus:outline-none"
                        onClick={e => e.preventDefault()}
                      />
                      <button onClick={(e) => { e.preventDefault(); updateReport(report.id, { volunteersNeeded: Number(editVolVal) }); setEditingVol(false); }} className="text-emerald-600 hover:text-emerald-700 cursor-pointer">✓</button>
                      <button onClick={(e) => { e.preventDefault(); setEditingVol(false); }} className="text-gray-400 hover:text-gray-500 cursor-pointer">✕</button>
                    </>
                  ) : (
                    <>
                      {report.enrolledCount}/{report.volunteersNeeded}
                      {userRole === 'voluntario' && (
                        <button onClick={(e) => { e.preventDefault(); setEditVolVal(report.volunteersNeeded); setEditingVol(true); }} className="ml-0.5 text-sky-400 hover:text-sky-600 cursor-pointer">
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </>
                  )}
                </span>
              )}
              {showZone && (
                <Link to={`/zone/${report.zoneId}`} className="text-sky-500 hover:text-sky-600 no-underline">
                  {report.zoneId}
                </Link>
              )}
            </div>

            <div className="flex gap-1.5">
              {userRole === 'voluntario' && hasSlots && (
                <button
                  onClick={(e) => { e.preventDefault(); enrollReport(report.id); }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isEnrolled
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  {isEnrolled ? 'Inscrito' : 'Inscribirse'}
                </button>
              )}
              {userRole === 'voluntario' && isEnrolled && !report.completed && threshold > 0 && (
                userCompletions.has(report.id) ? (
                  <button
                    onClick={(e) => { e.preventDefault(); unvoteComplete(report.id); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                    title="Cancelar confirmación"
                  >
                    <Flag className="w-3 h-3" /> Confirmado ({report.completionVotes || 0}/{threshold}) ✕
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.preventDefault(); voteComplete(report.id); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    <Flag className="w-3 h-3" /> Completado ({report.completionVotes || 0}/{threshold})
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
