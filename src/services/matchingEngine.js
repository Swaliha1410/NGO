// Haversine formula to calculate distance between two lat/lng points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Priority Score = (Urgency × 0.5) + (Skill Match × 0.3) + (Proximity × 0.2)
// Urgency: 1-5 (normalized to 0.2 - 1.0 internally for weight, or we just use 1-5 and scale others)
// Let's normalize everything to a 0-100 scale:
// Urgency (1-5) -> (Urgency / 5) * 50 points max
// Skill Match -> 1 or 0 -> 30 points max
// Proximity -> Max 20 points for 0km, 0 points for > 50km
export function calculatePriorityScore(need, volunteer) {
  // 1. Urgency Score (max 50)
  const urgencyWeight = 50;
  const normalizedUrgency = (need.Urgency || 1) / 5;
  const urgencyScore = normalizedUrgency * urgencyWeight;

  // 2. Skill Match Score (max 30)
  const skillWeight = 30;
  let skillMatch = 0;
  if (volunteer.Skills && need.Category) {
    const vSkills = volunteer.Skills.toLowerCase().split(',').map(s => s.trim());
    const nCategory = need.Category.toLowerCase();
    // Simple matching: if volunteer skills includes the need category
    if (vSkills.includes(nCategory) || vSkills.some(s => s.includes(nCategory) || nCategory.includes(s))) {
      skillMatch = 1;
    }
  }
  const skillScore = skillMatch * skillWeight;

  // 3. Proximity Score (max 20)
  const proximityWeight = 20;
  let proximityScore = 0;
  if (need.Latitude && need.Longitude && volunteer.Latitude && volunteer.Longitude) {
    const distanceKm = calculateDistance(need.Latitude, need.Longitude, volunteer.Latitude, volunteer.Longitude);
    // Score decays with distance. 0km = 20, 50km = 0
    const maxDistance = 50;
    const distanceFactor = Math.max(0, (maxDistance - distanceKm) / maxDistance);
    proximityScore = distanceFactor * proximityWeight;
  }

  return {
    totalScore: Math.round(urgencyScore + skillScore + proximityScore),
    urgencyScore: Math.round(urgencyScore),
    skillScore: Math.round(skillScore),
    proximityScore: Math.round(proximityScore),
    distanceKm: calculateDistance(need.Latitude, need.Longitude, volunteer.Latitude, volunteer.Longitude).toFixed(1)
  };
}

export function getRecommendedVolunteers(need, volunteers) {
  // Only consider available volunteers
  const availableVolunteers = volunteers.filter(v => v.Availability === 'Available');
  
  const scoredVolunteers = availableVolunteers.map(volunteer => {
    return {
      ...volunteer,
      ...calculatePriorityScore(need, volunteer)
    };
  });

  // Sort descending by total score
  scoredVolunteers.sort((a, b) => b.totalScore - a.totalScore);

  // Return top 3
  return scoredVolunteers.slice(0, 3);
}
