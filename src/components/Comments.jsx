import { useState, useEffect } from 'react';
import { MessageCircle, User, HardHat, Shield, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const ROLE_ICON = { voluntario: HardHat, admin: Shield };

export default function Comments({ reportId }) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.comments(reportId)
      .then((c) => { if (active) setComments(c); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reportId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setError('');
    try {
      const c = await api.addComment(reportId, body.trim());
      setComments((prev) => [...prev, c]);
      setBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="card-lg p-5 sm:p-6">
      <h2 className="section-heading mb-4">
        <MessageCircle className="w-5 h-5 text-sky-500" />
        Comentarios ({comments.length})
      </h2>

      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Agrega un comentario con información o actualizaciones..."
          rows={3}
          className="form-textarea"
          maxLength={2000}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={posting || !body.trim()} className="btn-primary disabled:opacity-60">
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Comentar'}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-6 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">Sé el primero en comentar</p>
        ) : (
          comments.map((c) => {
            const RoleIcon = ROLE_ICON[c.authorRole] || User;
            return (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <RoleIcon className="w-4 h-4 text-sky-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{c.authorName || 'Anónimo'}</span>
                    <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{c.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
