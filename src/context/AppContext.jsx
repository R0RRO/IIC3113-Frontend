import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api, setToken, getToken } from '../lib/api';

const AppContext = createContext();

// Convierte coordinates [lat,lng] -> {lat,lng} para el backend
function splitCoords(obj) {
  if (!obj.coordinates) return obj;
  const { coordinates, ...rest } = obj;
  return { ...rest, lat: coordinates[0], lng: coordinates[1] };
}

export function AppProvider({ children }) {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [userVotes, setUserVotes] = useState({});
  const [enrolledReports, setEnrolledReports] = useState(new Set());
  const [userCompletions, setUserCompletions] = useState(new Set());

  const [userCoords, setUserCoords] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const pollRef = useRef(null);

  // Ubicacion del usuario (para geo-gate de publicar/votar)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 8000, maximumAge: 60000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Carga datos publicos + estado del usuario
  const loadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [z, r] = await Promise.all([api.zones(), api.reports()]);
      setZones(z);
      setReports(r);
      if (getToken()) {
        const state = await api.myState();
        setUserVotes(state.votes || {});
        setEnrolledReports(new Set(state.enrollments || []));
        setUserCompletions(new Set(state.completions || []));
      }
    } catch (e) {
      console.error('Error cargando datos', e);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Al montar: si hay token, recupera sesion
  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          const { user } = await api.me();
          setUser(user);
        } catch {
          setToken(null);
        }
      }
      setAuthReady(true);
    })();
  }, []);

  // Cuando hay usuario: carga datos + arranca polling de notificaciones
  useEffect(() => {
    if (!user) return;
    loadAll();
    const poll = async () => {
      try {
        const { items, unread } = await api.notifications();
        setNotifications(items);
        setUnread(unread);
      } catch { /* ignore */ }
    };
    poll();
    pollRef.current = setInterval(poll, 30000);
    return () => clearInterval(pollRef.current);
  }, [user, loadAll]);

  // ---- auth ----
  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login(email, password);
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const { token, user } = await api.register(data);
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setUserVotes({});
    setEnrolledReports(new Set());
    setUserCompletions(new Set());
    setNotifications([]);
    setUnread(0);
  }, []);

  // ---- votos (optimista + reconcilia con servidor) ----
  const vote = useCallback(async (reportId, direction) => {
    if (!userCoords) { alert('Activa tu ubicacion para votar'); return; }
    const current = userVotes[reportId] || 0;
    const newVote = current === direction ? 0 : direction;
    setUserVotes((prev) => ({ ...prev, [reportId]: newVote }));
    setReports((prev) => prev.map((r) => r.id !== reportId ? r : { ...r, votes: r.votes + (newVote - current) }));
    try {
      const res = await api.vote(reportId, direction, userCoords[0], userCoords[1]);
      setReports((prev) => prev.map((r) => r.id !== reportId ? r : { ...r, votes: res.votes }));
      setUserVotes((prev) => ({ ...prev, [reportId]: res.myVote }));
    } catch (e) {
      setUserVotes((prev) => ({ ...prev, [reportId]: current }));
      setReports((prev) => prev.map((r) => r.id !== reportId ? r : { ...r, votes: r.votes - (newVote - current) }));
      alert(e.message);
    }
  }, [userVotes, userCoords]);

  // ---- reportes ----
  const addReport = useCallback(async (report) => {
    if (!userCoords) { alert('Activa tu ubicacion para publicar'); throw new Error('sin ubicacion'); }
    const { coordinates, enrolledCount, ...rest } = report;
    const payload = {
      ...rest,
      lat: coordinates[0],
      lng: coordinates[1],
      userLat: userCoords[0],
      userLng: userCoords[1],
      volunteersNeeded: Number(report.volunteersNeeded || 0),
    };
    const created = await api.createReport(payload);
    setReports((prev) => [created, ...prev]);
    setUserVotes((prev) => ({ ...prev, [created.id]: 1 }));
    return created.id;
  }, [userCoords]);

  const enrollReport = useCallback(async (reportId) => {
    const isEnrolled = enrolledReports.has(reportId);
    setEnrolledReports((prev) => {
      const next = new Set(prev);
      isEnrolled ? next.delete(reportId) : next.add(reportId);
      return next;
    });
    setReports((prev) => prev.map((r) => r.id !== reportId ? r : { ...r, enrolledCount: Math.max(0, (r.enrolledCount || 0) + (isEnrolled ? -1 : 1)) }));
    try {
      const res = isEnrolled ? await api.unenroll(reportId) : await api.enroll(reportId);
      setReports((prev) => prev.map((r) => r.id !== reportId ? r : { ...r, enrolledCount: res.enrolledCount }));
    } catch (e) {
      // revertir
      setEnrolledReports((prev) => {
        const next = new Set(prev);
        isEnrolled ? next.add(reportId) : next.delete(reportId);
        return next;
      });
      alert(e.message);
    }
  }, [enrolledReports]);

  const voteComplete = useCallback(async (reportId) => {
    if (userCompletions.has(reportId)) return;
    setUserCompletions((prev) => new Set([...prev, reportId]));
    try {
      const res = await api.complete(reportId);
      setReports((prev) => prev.map((r) => r.id !== reportId ? r : { ...r, completionVotes: res.completionVotes, completed: res.completed }));
    } catch (e) {
      setUserCompletions((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
      alert(e.message);
    }
  }, [userCompletions]);

  const unvoteComplete = useCallback(async (reportId) => {
    if (!userCompletions.has(reportId)) return;
    setUserCompletions((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
    try {
      const res = await api.uncomplete(reportId);
      setReports((prev) => prev.map((r) => r.id !== reportId ? r : { ...r, completionVotes: res.completionVotes, completed: false }));
    } catch (e) {
      setUserCompletions((prev) => new Set([...prev, reportId]));
      alert(e.message);
    }
  }, [userCompletions]);

  const deleteReport = useCallback(async (reportId) => {
    const prev = reports;
    setReports((rs) => rs.filter((r) => r.id !== reportId));
    try {
      await api.deleteReport(reportId);
    } catch (e) {
      setReports(prev);
      alert(e.message);
    }
  }, [reports]);

  const updateReport = useCallback(async (reportId, updates) => {
    setReports((prev) => prev.map((r) => r.id !== reportId ? r : { ...r, ...updates }));
    try {
      await api.updateReport(reportId, updates);
    } catch (e) {
      alert(e.message);
      loadAll();
    }
  }, [loadAll]);

  // ---- zonas ----
  const addZone = useCallback(async (zone) => {
    const created = await api.createZone(splitCoords(zone));
    setZones((prev) => [...prev, created]);
    return created.id;
  }, []);

  const updateZone = useCallback(async (zoneId, updates) => {
    const updated = await api.updateZone(zoneId, splitCoords(updates));
    setZones((prev) => prev.map((z) => z.id !== zoneId ? z : updated));
  }, []);

  const deleteZone = useCallback(async (zoneId) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    setReports((prev) => prev.filter((r) => r.zoneId !== zoneId));
    try {
      await api.deleteZone(zoneId);
    } catch (e) {
      alert(e.message);
      loadAll();
    }
  }, [loadAll]);

  const getZoneReports = useCallback((zoneId) => reports.filter((r) => r.zoneId === zoneId), [reports]);
  const getZone = useCallback((zoneId) => zones.find((z) => z.id === zoneId), [zones]);

  // ---- notificaciones ----
  const markNotifRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((u) => Math.max(0, u - 1));
    try { await api.markNotifRead(id); } catch { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try { await api.markAllRead(); } catch { /* ignore */ }
  }, []);

  return (
    <AppContext.Provider value={{
      zones,
      reports,
      user,
      userRole: user?.role ?? null,
      authReady,
      loadingData,
      userCoords,
      userVotes,
      enrolledReports,
      userCompletions,
      notifications,
      unread,
      login,
      register,
      logout,
      vote,
      addReport,
      enrollReport,
      voteComplete,
      unvoteComplete,
      deleteReport,
      updateReport,
      addZone,
      updateZone,
      deleteZone,
      getZoneReports,
      getZone,
      markNotifRead,
      markAllRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
