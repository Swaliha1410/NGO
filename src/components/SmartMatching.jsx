import React, { useMemo } from 'react';
import { getRecommendedVolunteers } from '../services/matchingEngine';
import { Award, MapPin, Stethoscope, Briefcase, ChevronRight } from 'lucide-react';

export default function SmartMatching({ need, volunteers, onAssign }) {
  const recommendations = useMemo(() => {
    if (!need) return [];
    return getRecommendedVolunteers(need, volunteers);
  }, [need, volunteers]);

  if (!need) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-primary)]/20 p-4 mt-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)]"></div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Award className="text-[var(--color-primary)]" size={20} />
            Smart Match Suggested
          </h3>
          <p className="text-sm text-gray-500">Auto-matched volunteers for {need.Title}</p>
        </div>
        <div className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-xs font-semibold">
          AI Powered
        </div>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">No available volunteers found for matching.</p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((vol, idx) => (
            <div key={vol.ID} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg border ${idx === 0 ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/5' : 'border-gray-100'} transition-all hover:shadow-md`}>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">{vol.Name}</span>
                  {idx === 0 && <span className="bg-[var(--color-secondary)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Top Match</span>}
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><MapPin size={12}/> {vol.distanceKm} km away</span>
                  <span className="flex items-center gap-1"><Briefcase size={12}/> {vol.Skills}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 sm:mt-0 w-full sm:w-auto">
                <div className="flex flex-col items-end">
                  <div className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-1">
                    Score: {vol.totalScore}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    S:{vol.skillScore} P:{vol.proximityScore} U:{vol.urgencyScore}
                  </div>
                </div>
                
                <button 
                  onClick={() => onAssign(need, vol)}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 w-full sm:w-auto justify-center"
                >
                  Assign <ChevronRight size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
