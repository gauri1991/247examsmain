export interface Organization {
  id: string;
  name: string;
  code: string;
  description: string;
  logo?: string;
  color: string;
  backgroundColor: string;
  website?: string;
  category: 'government' | 'private' | 'university' | 'coaching';
  isActive: boolean;
  examTypes: string[];
}

export const organizations: Organization[] = [
  {
    id: 'upsc',
    name: 'Union Public Service Commission',
    code: 'UPSC',
    description: 'Central recruitment agency for the Government of India',
    color: '#1f2937',
    backgroundColor: '#f3f4f6',
    website: 'https://upsc.gov.in',
    category: 'government',
    isActive: true,
    examTypes: ['civil_services', 'ies', 'cds', 'capf', 'nda', 'forest_service']
  },
  {
    id: 'ssc',
    name: 'Staff Selection Commission',
    code: 'SSC',
    description: 'Recruitment for Group B and Group C posts in central government',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    website: 'https://ssc.nic.in',
    category: 'government',
    isActive: true,
    examTypes: ['cgl', 'chsl', 'cpo', 'gd', 'je', 'steno', 'mts']
  },
  {
    id: 'ibps',
    name: 'Institute of Banking Personnel Selection',
    code: 'IBPS',
    description: 'Recruitment for public sector banks',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    website: 'https://ibps.in',
    category: 'government',
    isActive: true,
    examTypes: ['po', 'clerk', 'so', 'rrb_po', 'rrb_clerk', 'rrb_so']
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    code: 'SBI',
    description: 'India\'s largest public sector bank',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    website: 'https://sbi.co.in',
    category: 'government',
    isActive: true,
    examTypes: ['po', 'clerk', 'so', 'apprentice']
  },
  {
    id: 'railway',
    name: 'Railway Recruitment Board',
    code: 'RRB',
    description: 'Recruitment for Indian Railways',
    color: '#7c2d12',
    backgroundColor: '#fff7ed',
    website: 'https://indianrailways.gov.in',
    category: 'government',
    isActive: true,
    examTypes: ['ntpc', 'group_d', 'je', 'alp', 'tc', 'ecrc']
  },
  {
    id: 'nta',
    name: 'National Testing Agency',
    code: 'NTA',
    description: 'Premier testing organization for higher education entrance',
    color: '#7c3aed',
    backgroundColor: '#faf5ff',
    website: 'https://nta.ac.in',
    category: 'government',
    isActive: true,
    examTypes: ['jee_main', 'neet', 'ugc_net', 'cuet', 'icar', 'csir_net']
  },
  {
    id: 'gate',
    name: 'Graduate Aptitude Test in Engineering',
    code: 'GATE',
    description: 'All India examination for engineering graduates',
    color: '#ea580c',
    backgroundColor: '#fff7ed',
    website: 'https://gate.iitd.ac.in',
    category: 'university',
    isActive: true,
    examTypes: ['gate_cs', 'gate_ec', 'gate_me', 'gate_ce', 'gate_ee']
  },
  {
    id: 'cat',
    name: 'Common Admission Test',
    code: 'CAT',
    description: 'MBA entrance exam for IIMs and other B-schools',
    color: '#be185d',
    backgroundColor: '#fdf2f8',
    website: 'https://iimcat.ac.in',
    category: 'university',
    isActive: true,
    examTypes: ['mba', 'pgdm']
  }
];

export const getOrganizationById = (id: string): Organization | undefined => {
  return organizations.find(org => org.id === id);
};

export const getOrganizationsByCategory = (category: string): Organization[] => {
  return organizations.filter(org => org.category === category && org.isActive);
};

export const searchOrganizations = (query: string): Organization[] => {
  const lowercaseQuery = query.toLowerCase();
  return organizations.filter(org => 
    org.isActive && (
      org.name.toLowerCase().includes(lowercaseQuery) ||
      org.code.toLowerCase().includes(lowercaseQuery) ||
      org.description.toLowerCase().includes(lowercaseQuery)
    )
  );
};