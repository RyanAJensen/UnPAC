/**
 * Mock data stubs — used when API keys are absent.
 * Allows the app to build and demo without all keys set.
 */

export const MOCK_SPONSORED_LEGISLATION = [
  { billId: 'S1001', billTitle: 'Affordable Insulin Now Act', date: '2024-03-15', congress: 118 },
  { billId: 'S1002', billTitle: 'Clean Energy Investment and Innovation Act', date: '2024-02-20', congress: 118 },
  { billId: 'S1003', billTitle: 'Infrastructure Investment and Jobs Act Extension', date: '2024-01-10', congress: 118 },
  { billId: 'S1004', billTitle: 'National Defense Authorization Act Amendment', date: '2023-12-05', congress: 118 },
  { billId: 'S1005', billTitle: 'Student Loan Relief and Forgiveness Act', date: '2023-11-18', congress: 118 },
  { billId: 'S1006', billTitle: 'Medicare Prescription Drug Pricing Reform', date: '2023-10-22', congress: 118 },
  { billId: 'S1007', billTitle: 'Border Security and Immigration Reform Act', date: '2023-09-14', congress: 118 },
  { billId: 'S1008', billTitle: 'Fossil Fuel Subsidy Elimination Act', date: '2023-08-30', congress: 118 },
  { billId: 'S1009', billTitle: 'Small Business Tax Relief Act', date: '2023-07-25', congress: 118 },
  { billId: 'S1010', billTitle: 'Veterans Health Care Expansion Act', date: '2023-06-12', congress: 118 },
];

export const MOCK_FEC_SECTORS = [
  { sector: 'Finance', amount: 4820000, pct: 38.2 },
  { sector: 'Health', amount: 2100000, pct: 16.6 },
  { sector: 'Energy', amount: 1450000, pct: 11.5 },
  { sector: 'Legal', amount: 980000, pct: 7.8 },
  { sector: 'Technology', amount: 870000, pct: 6.9 },
  { sector: 'Defense', amount: 640000, pct: 5.1 },
  { sector: 'Real Estate', amount: 520000, pct: 4.1 },
  { sector: 'Other', amount: 1240000, pct: 9.8 },
];

export const MOCK_FEC_CONTRIBUTORS = [
  { name: 'Goldman Sachs PAC', employer: 'Goldman Sachs', amount: 42000, isPAC: true, isSuperPAC: false },
  { name: 'American Medical Association PAC', employer: 'AMA', amount: 38500, isPAC: true, isSuperPAC: false },
  { name: 'Senate Leadership Fund', employer: '', amount: 250000, isPAC: false, isSuperPAC: true },
  { name: 'Pfizer Inc.', employer: 'Pfizer', amount: 28000, isPAC: false, isSuperPAC: false },
  { name: 'JPMorgan Chase PAC', employer: 'JPMorgan Chase', amount: 26500, isPAC: true, isSuperPAC: false },
  { name: 'ExxonMobil PAC', employer: 'ExxonMobil', amount: 24000, isPAC: true, isSuperPAC: false },
];

export const MOCK_OPENSTATES_BILLS = [
  { title: 'An Act to Expand Mental Health Services in Public Schools', identifier: 'SB 101', session: '2023-2024' },
  { title: 'Environmental Protection and Climate Resilience Act', identifier: 'SB 203', session: '2023-2024' },
  { title: 'Small Business Relief and Economic Development Act', identifier: 'SB 318', session: '2023-2024' },
  { title: 'Housing Affordability and Tenant Protection Act', identifier: 'AB 445', session: '2023-2024' },
  { title: 'Renewable Energy Portfolio Standards Expansion', identifier: 'SB 512', session: '2023-2024' },
];

export const MOCK_MEMBER_DETAIL = {
  name: 'Senator (Demo)',
  party: 'D',
  state: 'NY',
  photoUrl: null,
  website: null,
};
