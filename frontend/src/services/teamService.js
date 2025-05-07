/**
 * Team Service
 * 
 * This service provides team data
 * In the future, this would connect to Supabase for real team data
 */

// Mock team data
const mockTeams = [
  {
    id: 1,
    name: 'Maple Leafs',
    location: 'Toronto',
    abbreviation: 'TOR',
    colors: {
      primary: '#00205B',
      secondary: '#FFFFFF'
    },
    conference: 'Eastern',
    division: 'Atlantic',
    arena: 'Scotiabank Arena',
    rating: 87,
    founded: 1917,
    logo: 'tor_logo.png'
  },
  {
    id: 2,
    name: 'Canadiens',
    location: 'Montreal',
    abbreviation: 'MTL',
    colors: {
      primary: '#AF1E2D',
      secondary: '#192168'
    },
    conference: 'Eastern',
    division: 'Atlantic',
    arena: 'Bell Centre',
    rating: 79,
    founded: 1909,
    logo: 'mtl_logo.png'
  },
  {
    id: 3,
    name: 'Bruins',
    location: 'Boston',
    abbreviation: 'BOS',
    colors: {
      primary: '#FFB81C',
      secondary: '#000000'
    },
    conference: 'Eastern',
    division: 'Atlantic',
    arena: 'TD Garden',
    rating: 88,
    founded: 1924,
    logo: 'bos_logo.png'
  },
  {
    id: 4,
    name: 'Lightning',
    location: 'Tampa Bay',
    abbreviation: 'TBL',
    colors: {
      primary: '#002868',
      secondary: '#FFFFFF'
    },
    conference: 'Eastern',
    division: 'Atlantic',
    arena: 'Amalie Arena',
    rating: 86,
    founded: 1992,
    logo: 'tbl_logo.png'
  },
  {
    id: 5,
    name: 'Panthers',
    location: 'Florida',
    abbreviation: 'FLA',
    colors: {
      primary: '#041E42',
      secondary: '#C8102E'
    },
    conference: 'Eastern',
    division: 'Atlantic',
    arena: 'Amerant Bank Arena',
    rating: 90,
    founded: 1993,
    logo: 'fla_logo.png'
  },
  {
    id: 6,
    name: 'Sabres',
    location: 'Buffalo',
    abbreviation: 'BUF',
    colors: {
      primary: '#002654',
      secondary: '#FCB514'
    },
    conference: 'Eastern',
    division: 'Atlantic',
    arena: 'KeyBank Center',
    rating: 81,
    founded: 1970,
    logo: 'buf_logo.png'
  },
  {
    id: 7,
    name: 'Red Wings',
    location: 'Detroit',
    abbreviation: 'DET',
    colors: {
      primary: '#CE1126',
      secondary: '#FFFFFF'
    },
    conference: 'Eastern',
    division: 'Atlantic',
    arena: 'Little Caesars Arena',
    rating: 80,
    founded: 1926,
    logo: 'det_logo.png'
  },
  {
    id: 8,
    name: 'Senators',
    location: 'Ottawa',
    abbreviation: 'OTT',
    colors: {
      primary: '#E31837',
      secondary: '#000000'
    },
    conference: 'Eastern',
    division: 'Atlantic',
    arena: 'Canadian Tire Centre',
    rating: 82,
    founded: 1992,
    logo: 'ott_logo.png'
  },
  {
    id: 9,
    name: 'Rangers',
    location: 'New York',
    abbreviation: 'NYR',
    colors: {
      primary: '#0038A8',
      secondary: '#CE1126'
    },
    conference: 'Eastern',
    division: 'Metropolitan',
    arena: 'Madison Square Garden',
    rating: 88,
    founded: 1926,
    logo: 'nyr_logo.png'
  },
  {
    id: 10,
    name: 'Islanders',
    location: 'New York',
    abbreviation: 'NYI',
    colors: {
      primary: '#00539B',
      secondary: '#F47D30'
    },
    conference: 'Eastern',
    division: 'Metropolitan',
    arena: 'UBS Arena',
    rating: 84,
    founded: 1972,
    logo: 'nyi_logo.png'
  },
  {
    id: 11,
    name: 'Penguins',
    location: 'Pittsburgh',
    abbreviation: 'PIT',
    colors: {
      primary: '#000000',
      secondary: '#FCB514'
    },
    conference: 'Eastern',
    division: 'Metropolitan',
    arena: 'PPG Paints Arena',
    rating: 85,
    founded: 1967,
    logo: 'pit_logo.png'
  },
  {
    id: 12,
    name: 'Capitals',
    location: 'Washington',
    abbreviation: 'WSH',
    colors: {
      primary: '#041E42',
      secondary: '#C8102E'
    },
    conference: 'Eastern',
    division: 'Metropolitan',
    arena: 'Capital One Arena',
    rating: 86,
    founded: 1974,
    logo: 'wsh_logo.png'
  }
];

// Get all teams
export const getAllTeams = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return {
    success: true,
    data: mockTeams
  };
};

// Get team by ID
export const getTeamById = async (teamId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const team = mockTeams.find(t => t.id === parseInt(teamId));
  
  if (!team) {
    return {
      success: false,
      error: 'Team not found'
    };
  }
  
  return {
    success: true,
    data: team
  };
};

// Get teams by conference
export const getTeamsByConference = async (conference) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const teams = mockTeams.filter(t => 
    t.conference.toLowerCase() === conference.toLowerCase()
  );
  
  return {
    success: true,
    data: teams
  };
};

// Get teams by division
export const getTeamsByDivision = async (division) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const teams = mockTeams.filter(t => 
    t.division.toLowerCase() === division.toLowerCase()
  );
  
  return {
    success: true,
    data: teams
  };
};

// Search teams by name or location
export const searchTeams = async (query) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const lowerQuery = query.toLowerCase();
  const teams = mockTeams.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) || 
    t.location.toLowerCase().includes(lowerQuery) ||
    t.abbreviation.toLowerCase().includes(lowerQuery)
  );
  
  return {
    success: true,
    data: teams
  };
}; 