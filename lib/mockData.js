/**
 * Mock data stubs — used when API keys are absent or rate-limited.
 * generateMockForRep(seed) produces deterministic but varied data per rep.
 */

// Simple seeded RNG (mulberry32)
function seededRng(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function () {
    h |= 0; h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

const ALL_BILLS = [
  // Healthcare
  { billTitle: 'Affordable Insulin Now Act', category: 'Healthcare' },
  { billTitle: 'Medicare Drug Pricing Reform Act', category: 'Healthcare' },
  { billTitle: 'Rural Hospital Stabilization Act', category: 'Healthcare' },
  { billTitle: 'Mental Health Access and Coverage Act', category: 'Healthcare' },
  { billTitle: "Children's Health Insurance Reauthorization", category: 'Healthcare' },
  // Environment
  { billTitle: 'Clean Energy Investment Act', category: 'Environment' },
  { billTitle: 'Fossil Fuel Subsidy Elimination Act', category: 'Environment' },
  { billTitle: 'Renewable Energy Portfolio Standards', category: 'Environment' },
  { billTitle: 'Climate Resilience and Adaptation Act', category: 'Environment' },
  // Economy
  { billTitle: 'Small Business Tax Relief Act', category: 'Economy' },
  { billTitle: 'Infrastructure Investment Extension', category: 'Economy' },
  { billTitle: 'Workforce Development and Training Act', category: 'Economy' },
  { billTitle: 'Supply Chain Security Act', category: 'Economy' },
  // Defense
  { billTitle: 'National Defense Authorization Act Amendment', category: 'Defense' },
  { billTitle: 'Veterans Health Care Expansion Act', category: 'Defense' },
  { billTitle: 'Military Housing Reform Act', category: 'Defense' },
  // Education
  { billTitle: 'Student Loan Relief Act', category: 'Education' },
  { billTitle: 'Early Childhood Education Investment Act', category: 'Education' },
  { billTitle: 'STEM Workforce Pipeline Act', category: 'Education' },
  // Immigration
  { billTitle: 'Border Security Modernization Act', category: 'Immigration' },
  { billTitle: 'DREAM Act Reauthorization', category: 'Immigration' },
  // Energy
  { billTitle: 'Nuclear Energy Innovation Act', category: 'Energy' },
  { billTitle: 'Pipeline Safety Enhancement Act', category: 'Energy' },
];

const SECTOR_POOLS = [
  [
    { sector: 'Finance', pct: 38.2 },
    { sector: 'Health', pct: 16.6 },
    { sector: 'Energy', pct: 11.5 },
    { sector: 'Legal', pct: 7.8 },
    { sector: 'Technology', pct: 6.9 },
    { sector: 'Defense', pct: 5.1 },
    { sector: 'Real Estate', pct: 4.1 },
    { sector: 'Other', pct: 9.8 },
  ],
  [
    { sector: 'Technology', pct: 31.4 },
    { sector: 'Finance', pct: 18.7 },
    { sector: 'Legal', pct: 12.3 },
    { sector: 'Education', pct: 9.8 },
    { sector: 'Healthcare', pct: 8.6 },
    { sector: 'Real Estate', pct: 6.2 },
    { sector: 'Other', pct: 13.0 },
  ],
  [
    { sector: 'Energy', pct: 29.1 },
    { sector: 'Defense', pct: 22.4 },
    { sector: 'Agriculture', pct: 14.7 },
    { sector: 'Finance', pct: 11.2 },
    { sector: 'Manufacturing', pct: 8.5 },
    { sector: 'Other', pct: 14.1 },
  ],
  [
    { sector: 'Healthcare', pct: 27.3 },
    { sector: 'Education', pct: 18.9 },
    { sector: 'Legal', pct: 15.4 },
    { sector: 'Labor Unions', pct: 12.1 },
    { sector: 'Technology', pct: 9.7 },
    { sector: 'Finance', pct: 6.3 },
    { sector: 'Other', pct: 10.3 },
  ],
  [
    { sector: 'Real Estate', pct: 24.8 },
    { sector: 'Finance', pct: 21.3 },
    { sector: 'Construction', pct: 16.7 },
    { sector: 'Legal', pct: 11.5 },
    { sector: 'Energy', pct: 9.2 },
    { sector: 'Other', pct: 16.5 },
  ],
];

const CONTRIBUTOR_POOLS = [
  [
    { name: 'Goldman Sachs PAC', employer: 'Goldman Sachs', isPAC: true, isSuperPAC: false },
    { name: 'Senate Leadership Fund', employer: '', isPAC: false, isSuperPAC: true },
    { name: 'American Medical Assn PAC', employer: 'AMA', isPAC: true, isSuperPAC: false },
    { name: 'JPMorgan Chase PAC', employer: 'JPMorgan Chase', isPAC: true, isSuperPAC: false },
    { name: 'Pfizer Inc.', employer: 'Pfizer', isPAC: false, isSuperPAC: false },
    { name: 'ExxonMobil PAC', employer: 'ExxonMobil', isPAC: true, isSuperPAC: false },
  ],
  [
    { name: 'Google LLC', employer: 'Google', isPAC: false, isSuperPAC: false },
    { name: 'Microsoft PAC', employer: 'Microsoft', isPAC: true, isSuperPAC: false },
    { name: 'American Bar Association PAC', employer: 'ABA', isPAC: true, isSuperPAC: false },
    { name: 'Congressional Leadership Fund', employer: '', isPAC: false, isSuperPAC: true },
    { name: 'Apple Inc.', employer: 'Apple', isPAC: false, isSuperPAC: false },
    { name: 'Alphabet Inc.', employer: 'Alphabet', isPAC: false, isSuperPAC: false },
  ],
  [
    { name: 'Lockheed Martin PAC', employer: 'Lockheed Martin', isPAC: true, isSuperPAC: false },
    { name: 'Chevron Corp PAC', employer: 'Chevron', isPAC: true, isSuperPAC: false },
    { name: 'American Farm Bureau PAC', employer: 'AFB', isPAC: true, isSuperPAC: false },
    { name: 'Senate Majority PAC', employer: '', isPAC: false, isSuperPAC: true },
    { name: 'Raytheon Technologies PAC', employer: 'Raytheon', isPAC: true, isSuperPAC: false },
    { name: 'Koch Industries', employer: 'Koch Industries', isPAC: false, isSuperPAC: false },
  ],
  [
    { name: 'SEIU PAC', employer: 'SEIU', isPAC: true, isSuperPAC: false },
    { name: 'National Education Assn PAC', employer: 'NEA', isPAC: true, isSuperPAC: false },
    { name: 'American Federation of Teachers', employer: 'AFT', isPAC: true, isSuperPAC: false },
    { name: 'Planned Parenthood Action Fund', employer: '', isPAC: false, isSuperPAC: true },
    { name: 'Kaiser Permanente', employer: 'Kaiser', isPAC: false, isSuperPAC: false },
    { name: 'Trial Lawyers PAC', employer: '', isPAC: true, isSuperPAC: false },
  ],
];

const BASE_AMOUNTS = [12_500_000, 8_200_000, 6_800_000, 15_300_000, 9_700_000];
const CONTRIB_AMOUNTS = [250000, 42000, 38500, 28000, 26500, 24000, 180000, 55000];
// Weighted pool: Yes appears more than No/Not Voting (realistic distribution)
const VOTE_POSITIONS = ['Yes', 'Yes', 'Yes', 'No', 'No', 'Not Voting'];

// Landmark bills shown in mock data when GovTrack is unavailable
const MOCK_LANDMARK_VOTES = [
  { billTitle: 'CHIPS and Science Act',               category: 'Economy',  date: '2022-07-28' },
  { billTitle: 'Ukraine Aid Supplemental (2024)',      category: 'Defense',  date: '2024-04-20' },
  { billTitle: 'Big Beautiful Bill',                  category: 'Economy',  date: '2025-05-22' },
  { billTitle: 'Israel Aid Supplemental (2024)',       category: 'Defense',  date: '2024-04-20' },
  { billTitle: 'Taiwan Aid Supplemental (2024)',       category: 'Defense',  date: '2024-04-20' },
  { billTitle: 'Impeachment of Trump (Jan. 6, 2021)', category: 'Other',    date: '2021-01-13' },
  { billTitle: 'Impeachment of Trump (Ukraine, 2019)', category: 'Other',   date: '2019-12-18' },
];

function mockDate(rng, yearOffset = 0) {
  const year = 2023 + yearOffset + Math.floor(rng() * 2);
  const month = String(1 + Math.floor(rng() * 12)).padStart(2, '0');
  const day = String(1 + Math.floor(rng() * 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateMockForRep(seed = 'default', { includeLandmark = true } = {}) {
  const rng = seededRng(seed);

  // Finance mock
  const baseProfile = pick(rng, SECTOR_POOLS);
  const totalRaised = BASE_AMOUNTS[Math.floor(rng() * BASE_AMOUNTS.length)];
  const noisy = baseProfile.map(s => ({ ...s, pct: Math.max(0.5, s.pct + (rng() - 0.5) * 10) }));
  const total = noisy.reduce((sum, s) => sum + s.pct, 0);
  const sectors = noisy.map(s => ({ ...s, pct: Math.round((s.pct / total) * 1000) / 10 }));
  const sectorsFull = sectors.map(s => ({ ...s, amount: Math.round(totalRaised * (s.pct / 100)) }));
  const pool = pick(rng, CONTRIBUTOR_POOLS);
  const topContributors = pool.map((c, i) => ({
    ...c,
    amount: CONTRIB_AMOUNTS[i] ?? Math.round(rng() * 40000 + 10000),
  }));

  // Bills mock — mix of Sponsored, Cosponsored, and actual votes
  const totalBills = 8 + Math.floor(rng() * 4);
  const shuffled = [...ALL_BILLS].sort(() => rng() - 0.5).slice(0, totalBills);
  const sponsoredCount   = Math.max(2, Math.floor(totalBills * 0.35));
  const cosponsoredCount = Math.floor(totalBills * 0.30);
  // remainder become floor votes

  const prefix = seed.slice(0, 3).toUpperCase();

  // Pick 2–4 landmark votes seeded to this rep
  const numLandmark = 2 + Math.floor(rng() * 3);
  const landmarkSample = [...MOCK_LANDMARK_VOTES]
    .sort(() => rng() - 0.5)
    .slice(0, numLandmark);
  const landmarkEntries = landmarkSample.map(b => {
    const position = pick(rng, VOTE_POSITIONS);
    return {
      billId:     null,
      billTitle:  b.billTitle,
      category:   b.category,
      vote:       position,
      weight:     (position === 'Yes' || position === 'No') ? 0.3 : 0.1,
      isLandmark: true,
      date:       b.date,
    };
  });

  const bills = [
    // Landmark votes — only included for federal reps (not state/local)
    ...(includeLandmark ? landmarkEntries : []),
    // Sponsored — strongest signal
    ...shuffled.slice(0, sponsoredCount).map((b, i) => ({
      billId:    `${prefix}${1000 + i}`,
      billTitle: b.billTitle,
      category:  b.category,
      vote:      'Sponsored',
      weight:    1.0,
      isLandmark: false,
      date:      mockDate(rng, 1),
    })),
    // Cosponsored — explicit but secondary support
    ...shuffled.slice(sponsoredCount, sponsoredCount + cosponsoredCount).map((b, i) => ({
      billId:    `${prefix}${1100 + i}`,
      billTitle: b.billTitle,
      category:  b.category,
      vote:      'Cosponsored',
      weight:    0.5,
      isLandmark: false,
      date:      mockDate(rng, 1),
    })),
    // Floor votes — least weight per bill
    ...shuffled.slice(sponsoredCount + cosponsoredCount).map((b) => {
      const position = pick(rng, VOTE_POSITIONS);
      return {
        billId:    null,
        billTitle: b.billTitle,
        category:  b.category,
        vote:      position,
        weight:    (position === 'Yes' || position === 'No') ? 0.3 : 0.1,
        isLandmark: false,
        date:      mockDate(rng, 0),
      };
    }),
  ].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  return {
    bills,
    finance: { cycle: '2024', totalRaised, sectors: sectorsFull, topContributors },
  };
}

// Static fallbacks for OpenStates cosponsored mock
export const MOCK_OPENSTATES_BILLS = [
  { title: 'An Act to Expand Mental Health Services in Public Schools', identifier: 'SB 101', session: '2023-2024' },
  { title: 'Environmental Protection and Climate Resilience Act', identifier: 'SB 203', session: '2023-2024' },
  { title: 'Small Business Relief and Economic Development Act', identifier: 'SB 318', session: '2023-2024' },
  { title: 'Housing Affordability and Tenant Protection Act', identifier: 'AB 445', session: '2023-2024' },
  { title: 'Renewable Energy Portfolio Standards Expansion', identifier: 'SB 512', session: '2023-2024' },
];

export const MOCK_OPENSTATES_COSPONSORED = [
  { title: 'Criminal Justice Reform and Second Chance Act', identifier: 'SB 215', session: '2023-2024' },
  { title: 'Public School Infrastructure Investment Act', identifier: 'AB 302', session: '2023-2024' },
  { title: 'Broadband Access Expansion for Rural Communities', identifier: 'SB 418', session: '2023-2024' },
];

export const MOCK_MEMBER_DETAIL = {
  name: null,
  party: null,
  state: null,
  photoUrl: null,
  website: null,
};
