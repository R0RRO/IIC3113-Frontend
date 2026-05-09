import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import RoleSelector from './components/RoleSelector';
import Home from './pages/Home';
import Zones from './pages/Zones';
import ZoneDetail from './pages/ZoneDetail';
import MapView from './pages/MapView';
import ReportDetail from './pages/ReportDetail';
import AdminPanel from './pages/AdminPanel';

function AppShell() {
  const { userRole } = useApp();
  return (
    <div className="min-h-screen bg-sky-50">
      {!userRole && <RoleSelector />}
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
