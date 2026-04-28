import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Users, Filter, ArrowUpDown } from 'lucide-react';
import SmartMatching from './SmartMatching';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon creator based on urgency
const getIcon = (urgency) => {
  const color = urgency >= 4 ? '#E76F51' : urgency === 3 ? '#F4A261' : '#58B368';
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

export default function NeedsDashboard({ needs, volunteers, onAssign }) {
  const [selectedNeedId, setSelectedNeedId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency' | 'people'

  const selectedNeed = needs.find(n => n.ID === selectedNeedId);

  const filteredNeeds = needs
    .filter(n => filterCategory === 'All' || n.Category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'urgency') return b.Urgency - a.Urgency;
      if (sortBy === 'people') return b.PeopleAffected - a.PeopleAffected;
      return 0;
    });

  const categories = ['All', ...new Set(needs.map(n => n.Category).filter(Boolean))];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      
      {/* Left Panel: Needs List */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-800">Community Needs</h2>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Filter className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
              <select 
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none bg-white"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <button 
              onClick={() => setSortBy(sortBy === 'urgency' ? 'people' : 'urgency')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-1 text-sm"
              title={`Sort by ${sortBy === 'urgency' ? 'People Affected' : 'Urgency'}`}
            >
              <ArrowUpDown size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredNeeds.map(need => (
            <div 
              key={need.ID}
              onClick={() => setSelectedNeedId(need.ID)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedNeedId === need.ID ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-md' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">{need.Title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  need.Status === 'Completed' ? 'bg-green-100 text-green-700' :
                  need.Status === 'Assigned' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {need.Status}
                </span>
              </div>
              
              <div className="flex gap-4 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${need.Urgency >= 4 ? 'bg-[#E76F51]' : need.Urgency === 3 ? 'bg-[#F4A261]' : 'bg-[#58B368]'}`}></span>
                  Urgency {need.Urgency}/5
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {need.PeopleAffected} affected
                </span>
              </div>
              <div className="text-xs font-medium text-[var(--color-primary)]">
                {need.Category}
              </div>
            </div>
          ))}
          {filteredNeeds.length === 0 && (
             <div className="text-center py-8 text-gray-500 text-sm">No needs match your filters.</div>
          )}
        </div>
      </div>

      {/* Right Panel: Map & Smart Matching */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 relative min-h-[300px]">
          <MapContainer 
            center={[34.0522, -118.2437]} // Default to LA for mock data. You might calculate bounds based on needs data.
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {needs.map(need => (
              need.Latitude && need.Longitude ? (
                <Marker 
                  key={need.ID} 
                  position={[need.Latitude, need.Longitude]}
                  icon={getIcon(need.Urgency)}
                  eventHandlers={{
                    click: () => setSelectedNeedId(need.ID),
                  }}
                >
                  <Popup>
                    <div className="font-sans">
                      <h4 className="font-bold text-sm m-0 mb-1">{need.Title}</h4>
                      <p className="text-xs m-0 text-gray-600 mb-1">Cat: {need.Category}</p>
                      <p className="text-xs m-0 text-gray-600">Affected: {need.PeopleAffected}</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}
          </MapContainer>
        </div>

        {/* Smart Matching Section when a Need is selected */}
        {selectedNeed && selectedNeed.Status === 'Open' && (
          <SmartMatching need={selectedNeed} volunteers={volunteers} onAssign={onAssign} />
        )}
      </div>

    </div>
  );
}
