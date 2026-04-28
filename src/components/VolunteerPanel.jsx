import React, { useState } from 'react';
import { UserPlus, MapPin, Briefcase } from 'lucide-react';

export default function VolunteerPanel({ volunteers, onAddVolunteer }) {
  const [showForm, setShowForm] = useState(false);
  
  // New volunteer form state
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !skills || !latitude || !longitude) return;
    
    const newVol = {
      ID: 'V' + Date.now(), // Mock ID
      Name: name,
      Skills: skills,
      Availability: 'Available',
      Latitude: parseFloat(latitude),
      Longitude: parseFloat(longitude)
    };
    
    onAddVolunteer(newVol);
    
    // Reset
    setName('');
    setSkills('');
    setLatitude('');
    setLongitude('');
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
      
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Volunteer Directory</h2>
          <p className="text-sm text-gray-500">Manage and onboard new responders.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <UserPlus size={18} /> {showForm ? 'Cancel' : 'Register Volunteer'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* Registration Form */}
        {showForm && (
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 text-gray-800">New Registration</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                <input required type="text" value={skills} onChange={e => setSkills(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm" placeholder="Medical, Logistics, Food" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input required type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm" placeholder="34.0522" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input required type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm" placeholder="-118.2437" />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white font-medium py-2 rounded-lg transition-colors">
                Save & Register
              </button>
            </form>
          </div>
        )}

        {/* Volunteer List */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col ${showForm ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Skills</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {volunteers.map(vol => (
                  <tr key={vol.ID} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-800 text-sm">{vol.Name}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5"><Briefcase size={14} className="text-gray-400"/> {vol.Skills}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                       <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {vol.Latitude?.toFixed(2)}, {vol.Longitude?.toFixed(2)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        vol.Availability === 'Available' ? 'bg-green-100 text-green-700' :
                        vol.Availability === 'Assigned' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {vol.Availability}
                      </span>
                    </td>
                  </tr>
                ))}
                {volunteers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">No volunteers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
