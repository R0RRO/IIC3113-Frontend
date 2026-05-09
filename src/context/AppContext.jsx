import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { zones as initialZones, initialReports } from '../data/mockData';

const AppContext = createContext();

function loadRole() {
  return localStorage.getItem('mingup_role') || null;
}

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [zones, setZones] = useState(() => loadState('mingup_zones', initialZones));
  const [reports, setReports] = useState(() => loadState('mingup_reports', initialReports));
  const [userVotes, setUserVotes] = useState({});
  const [userRole, setUserRoleState] = useState(loadRole);
  const [enrolledReports, setEnrolledReports] = useState(new Set());
  const [userCompletions, setUserCompletions] = useState(new Set());

  useEffect(() => { localStorage.setItem('mingup_zones', JSON.stringify(zones)); }, [zones]);
  useEffect(() => { localStorage.setItem('mingup_reports', JSON.stringify(reports)); }, [reports]);

  const setUserRole = useCallback((role) => {
    localStorage.setItem('mingup_role', role);
    setUserRoleState(role);
  }, []);

  const vote = useCallback((reportId, direction) => {
    const currentVote = userVotes[reportId] || 0;
    const newVote = currentVote === direction ? 0 : direction;
    setUserVotes(prev => ({ ...prev, [reportId]: newVote }));
    setReports(prev =>
      prev.map(r => r.id !== reportId ? r : { ...r, votes: r.votes + (newVote - currentVote) })
    );
  }, [userVotes]);

  const addReport = useCallback((report) => {
    const newReport = {
      id: Date.now(),
      votes: 1,
      author: userRole === 'voluntario' ? 'Voluntario' : 'Vecino',
      authorRole: userRole || 'vecino',
      createdAt: new Date().toISOString(),
      comments: 0,
      enrolledCount: 0,
      volunteersNeeded: 0,
      ...report,
    };
    setReports(prev => [newReport, ...prev]);
    setUserVotes(prev => ({ ...prev, [newReport.id]: 1 }));
    return newReport.id;
  }, [userRole]);

  const enrollReport = useCallback((reportId) => {
    const isEnrolled = enrolledReports.has(reportId);
    const delta = isEnrolled ? -1 : 1;
    setEnrolledReports(prev => {
      const next = new Set(prev);
      isEnrolled ? next.delete(reportId) : next.add(reportId);
      return next;
    });
    setReports(prev =>
      prev.map(rep =>
        rep.id !== reportId
          ? rep
          : { ...rep, enrolledCount: Math.max(0, (rep.enrolledCount || 0) + delta) }
      )
    );
  }, [enrolledReports]);

  const voteComplete = useCallback((reportId) => {
    if (userCompletions.has(reportId)) return;
    setUserCompletions(prev => new Set([...prev, reportId]));
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      const newVotes = (r.completionVotes || 0) + 1;
      const threshold = Math.ceil((r.enrolledCount || 0) / 2);
      const completed = threshold > 0 && newVotes >= threshold;
      return { ...r, completionVotes: newVotes, completed };
    }));
  }, [userCompletions]);

  const unvoteComplete = useCallback((reportId) => {
    if (!userCompletions.has(reportId)) return;
    setUserCompletions(prev => { const next = new Set(prev); next.delete(reportId); return next; });
    setReports(prev => prev.map(r =>
      r.id !== reportId ? r : { ...r, completionVotes: Math.max(0, (r.completionVotes || 0) - 1), completed: false }
    ));
  }, [userCompletions]);

  const deleteReport = useCallback((reportId) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  const updateReport = useCallback((reportId, updates) => {
    setReports(prev => prev.map(r => r.id !== reportId ? r : { ...r, ...updates }));
  }, []);

  // Zone mutations
  const addZone = useCallback((zone) => {
    const newZone = { ...zone, id: zone.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now() };
    setZones(prev => [...prev, newZone]);
    return newZone.id;
  }, []);

  const updateZone = useCallback((zoneId, updates) => {
    setZones(prev => prev.map(z => z.id !== zoneId ? z : { ...z, ...updates }));
  }, []);

  const deleteZone = useCallback((zoneId) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
    setReports(prev => prev.filter(r => r.zoneId !== zoneId));
  }, []);

  const getZoneReports = useCallback((zoneId) => {
    return reports.filter(r => r.zoneId === zoneId);
  }, [reports]);

  const getZone = useCallback((zoneId) => {
    return zones.find(z => z.id === zoneId);
  }, [zones]);

  return (
    <AppContext.Provider value={{
      zones,
      reports,
      userVotes,
      userRole,
      enrolledReports,
      vote,
      addReport,
      enrollReport,
      setUserRole,
      userCompletions,
      voteComplete,
      unvoteComplete,
      deleteReport,
      updateReport,
      addZone,
      updateZone,
      deleteZone,
      getZoneReports,
      getZone,
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
