import React from 'react';
import { Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function SummaryStats({ needs, volunteers }) {
  const totalNeeds = needs.length;
  const openNeeds = needs.filter(n => n.Status === 'Open').length;
  const needsFulfilled = needs.filter(n => n.Status === 'Completed').length;
  const activeAssignments = needs.filter(n => n.Status === 'Assigned').length;
  const volunteersAvailable = volunteers.filter(v => v.Availability === 'Available').length;

  const statCards = [
    { label: 'Total Needs', value: totalNeeds, icon: AlertCircle, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
    { label: 'Open Needs', value: openNeeds, icon: Clock, color: 'text-[var(--color-urgency-high)]', bg: 'bg-[var(--color-urgency-high)]/10' },
    { label: 'Needs Fulfilled', value: needsFulfilled, icon: CheckCircle, color: 'text-[var(--color-secondary)]', bg: 'bg-[var(--color-secondary)]/10' },
    { label: 'Volunteers Available', value: volunteersAvailable, icon: Users, color: 'text-[var(--color-secondary)]', bg: 'bg-[var(--color-secondary)]/10' },
    { label: 'Active Assignments', value: activeAssignments, icon: Users, color: 'text-[var(--color-urgency-medium)]', bg: 'bg-[var(--color-urgency-medium)]/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
