import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import Home from './pages/Home';
import Zones from './pages/Zones';
import ZoneDetail from './pages/ZoneDetail';
import MapView from './pages/MapView';
import ReportDetail from './pages/ReportDetail';
import AdminPanel from './pages/AdminPanel';

function AppShell() {
  const { user, authReady } = useApp();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/zones" element={<Zones />} />
        <Route path="/zone/:zoneId" element={<ZoneDetail />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/report/:reportId" element={<ReportDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
