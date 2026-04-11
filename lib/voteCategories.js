const CATEGORY_RULES = [
  { category: 'Healthcare', keywords: ['health', 'medicare', 'medicaid', 'affordable care', 'prescription', 'drug price', 'insulin', 'mental health', 'hospital', 'aca'] },
  { category: 'Environment', keywords: ['climate', 'environment', 'emission', 'clean energy', 'carbon', 'epa', 'pollution', 'fossil fuel', 'renewable', 'wildfire', 'conservation'] },
  { category: 'Economy', keywords: ['tax', 'budget', 'appropriation', 'debt', 'inflation', 'tariff', 'trade', 'minimum wage', 'labor', 'stimulus', 'infrastructure', 'spending'] },
  { category: 'Defense', keywords: ['defense', 'military', 'armed forces', 'ndaa', 'pentagon', 'veteran', 'national security', 'nato', 'ukraine', 'israel', 'weapons'] },
  { category: 'Immigration', keywords: ['immigration', 'border', 'asylum', 'daca', 'visa', 'deportation', 'undocumented', 'refugee', 'migrant'] },
  { category: 'Education', keywords: ['education', 'school', 'student loan', 'pell', 'title i', 'higher education', 'college', 'k-12', 'university'] },
  { category: 'Energy', keywords: ['energy', 'oil', 'gas', 'pipeline', 'nuclear', 'solar', 'wind power', 'drilling', 'lng', 'fracking', 'petroleum'] },
];

export function categorize(title = '', description = '') {
  const text = (title + ' ' + description).toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) return rule.category;
  }
  return 'Other';
}
