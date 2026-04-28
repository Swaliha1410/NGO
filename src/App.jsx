import React, { useState, useEffect } from 'react';
import { fetchNeeds, fetchVolunteers, saveVolunteer, assignNeedInSheet, assignVolunteerInSheet } from './services/dataService';
import SummaryStats from './components/SummaryStats';
import NeedsDashboard from './components/NeedsDashboard';
import VolunteerPanel from './components/VolunteerPanel';
import { LayoutDashboard, Users, Activity } from 'lucide-react';
import 'leaflet/dist/leaflet.css'; // Essential for Leaflet map styling

function App() {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'volunteers'
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [needsData, volunteersData] = await Promise.all([
        fetchNeeds(),
        fetchVolunteers()
      ]);
      setNeeds(needsData);
      setVolunteers(volunteersData);
      setLoading(false);
    };
    loadData();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAssign = async (need, volunteer) => {
    // Optimistic UI Update first (instant feedback)
    setNeeds(needs.map(n =>
      n.ID === need.ID ? { ...n, Status: 'Assigned' } : n
    ));
    setVolunteers(volunteers.map(v =>
      v.ID === volunteer.ID ? { ...v, Availability: 'Assigned' } : v
    ));

    // Real write to Google Sheet via Apps Script
    await Promise.all([
      assignNeedInSheet(need.ID),
      assignVolunteerInSheet(volunteer.ID),
    ]);

    showToast(`✅ ${volunteer.Name} assigned to "${need.Title}" — Sheet updated!`);
  };

  const handleAddVolunteer = async (newVolunteer) => {
    // Optimistic UI Update first (instant feedback)
    setVolunteers([...volunteers, newVolunteer]);

    // Real write to Google Sheet via Apps Script
    await saveVolunteer(newVolunteer);

    showToast(`✅ ${newVolunteer.Name} registered & saved to Google Sheet!`);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--color-background)]">
        <Activity className="animate-spin text-[var(--color-primary)] mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-700">Loading Smart Allocation System...</h2>
        <p className="text-sm text-gray-500">Fetching live data from Google Sheets</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-gray-800 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[var(--color-primary)] mb-1">
            <Activity size={28} className="stroke-[2.5]" />
            <h1 className="text-2xl font-black tracking-tight leading-none">NGO<span className="text-[var(--color-secondary)]">Link</span></h1>
          </div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Smart Allocation</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'dashboard' 
                ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard size={20} /> Needs Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('volunteers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'volunteers' 
                ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Users size={20} /> Volunteer Directory
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Info */}
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {activeTab === 'dashboard' ? 'Needs & Resources Dashboard' : 'Volunteer Management'}
            </h2>
            <p className="text-gray-500 text-sm">
              {activeTab === 'dashboard' 
                ? 'Monitor live community needs and auto-match resources using AI priority scoring.'
                : 'Manage volunteer status, skills, and register new ground personnel.'}
            </p>
          </header>

          <SummaryStats needs={needs} volunteers={volunteers} />

          {activeTab === 'dashboard' ? (
            <NeedsDashboard needs={needs} volunteers={volunteers} onAssign={handleAssign} />
          ) : (
            <VolunteerPanel volunteers={volunteers} onAddVolunteer={handleAddVolunteer} />
          )}

        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in-up z-50">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default App;
