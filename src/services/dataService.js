import Papa from 'papaparse';

// ─── Google Sheets Config ───────────────────────────────────────────────────
const SHEET_ID = '1qbZSPGqfmAN9Y4Su4jRyiKs9WWqzmU6uKPU51IW4pG8';
const NEEDS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const VOLUNTEERS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1`;

// ─── Google Apps Script Web App URL (real backend) ─────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHbc_NmmARR6253mhkIbcdMUc1rvW1iw87inSs5EpG50gLMzYv6MIk-boLAPKasf9z/exec';

// ─── Mock Fallback Data ─────────────────────────────────────────────────────
const MOCK_NEEDS = [
  { ID: 'N1', Title: 'Emergency Food Supplies', Category: 'Food', Latitude: 34.0522, Longitude: -118.2437, Urgency: 5, PeopleAffected: 150, Status: 'Open' },
  { ID: 'N2', Title: 'Medical Tents Needed', Category: 'Medical', Latitude: 34.0622, Longitude: -118.2537, Urgency: 4, PeopleAffected: 50, Status: 'Open' },
  { ID: 'N3', Title: 'Temporary Shelters', Category: 'Shelter', Latitude: 34.0422, Longitude: -118.2337, Urgency: 3, PeopleAffected: 200, Status: 'Assigned' },
  { ID: 'N4', Title: 'School Supplies', Category: 'Education', Latitude: 34.0722, Longitude: -118.2637, Urgency: 1, PeopleAffected: 300, Status: 'Completed' },
];

const MOCK_VOLUNTEERS = [
  { ID: 'V1', Name: 'Alice Smith', Skills: 'Medical, First Aid', Availability: 'Available', Latitude: 34.0650, Longitude: -118.2500 },
  { ID: 'V2', Name: 'Bob Jones', Skills: 'Logistics, Food', Availability: 'Available', Latitude: 34.0500, Longitude: -118.2400 },
  { ID: 'V3', Name: 'Charlie Brown', Skills: 'Construction, Shelter', Availability: 'Assigned', Latitude: 34.0450, Longitude: -118.2300 },
  { ID: 'V4', Name: 'Diana Prince', Skills: 'Education, Counseling', Availability: 'Offline', Latitude: 34.0750, Longitude: -118.2600 },
];

// ─── CSV Fetch Helper ───────────────────────────────────────────────────────
const fetchCSV = (url) => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const first = results.data[0];
        if (
          results.data.length > 0 &&
          Object.keys(first).length <= 1 &&
          first[Object.keys(first)[0]]?.toString().includes('<html')
        ) {
          reject(new Error('Received HTML instead of CSV. Is the sheet public?'));
        } else {
          resolve(results.data.filter((row) => row.ID));
        }
      },
      error: (error) => reject(error),
    });
  });
};

// ─── READ: Fetch Needs ──────────────────────────────────────────────────────
export const fetchNeeds = async () => {
  try {
    const data = await fetchCSV(NEEDS_CSV_URL);
    if (data && data.length > 0 && data[0].Title) return data;
    throw new Error('Invalid needs data format');
  } catch (err) {
    console.warn('Failed to fetch Needs from Google Sheets, using mock data.', err);
    return [...MOCK_NEEDS];
  }
};

// ─── READ: Fetch Volunteers ─────────────────────────────────────────────────
export const fetchVolunteers = async () => {
  try {
    const data = await fetchCSV(VOLUNTEERS_CSV_URL);
    if (data && data.length > 0 && data[0].Name) return data;
    throw new Error('Invalid volunteer data format');
  } catch (err) {
    console.warn('Failed to fetch Volunteers from Google Sheets, using mock data.', err);
    return [...MOCK_VOLUNTEERS];
  }
};

// ─── WRITE Helper: POST to Apps Script ─────────────────────────────────────
const postToSheet = async (payload) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      // Apps Script requires no-cors mode when called from browser
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('✅ Sheet updated successfully:', payload.type);
    return { success: true };
  } catch (err) {
    console.error('❌ Failed to update Google Sheet:', err);
    return { success: false, error: err.message };
  }
};

// ─── WRITE: Register new Volunteer → Saves to Google Sheet ─────────────────
export const saveVolunteer = async (volunteer) => {
  return postToSheet({
    type: 'volunteer',
    ID: volunteer.ID,
    Name: volunteer.Name,
    Skills: volunteer.Skills,
    Availability: volunteer.Availability,
    Latitude: volunteer.Latitude,
    Longitude: volunteer.Longitude,
  });
};

// ─── WRITE: Assign Need → Updates Need status in Google Sheet ───────────────
export const assignNeedInSheet = async (needID) => {
  return postToSheet({ type: 'assign_need', ID: needID });
};

// ─── WRITE: Assign Volunteer → Updates Volunteer status in Google Sheet ─────
export const assignVolunteerInSheet = async (volunteerID) => {
  return postToSheet({ type: 'assign_volunteer', ID: volunteerID });
};
