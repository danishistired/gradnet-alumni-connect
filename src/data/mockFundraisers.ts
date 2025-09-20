export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  studentName: string;
  studentEmail: string;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  fundingGoal: string;
  businessModel: string;
  marketSize: string;
  competition: string;
  teamSize: number;
  timeline: string;
  riskAssessment: string;
  investorsCount: number;
  createdAt: string;
  status: 'active' | 'completed' | 'draft';
  tags: string[];
  pitchDeck?: string;
  businessPlan?: string;
  financialProjections?: string;
}

export interface Investment {
  id: string;
  fundraiserId: string;
  investorName: string;
  amount: number;
  date: string;
  type: 'equity' | 'loan' | 'grant';
}

export const mockFundraisers: Fundraiser[] = [
  {
    id: '1',
    title: 'EcoTech Solutions - Sustainable Energy Storage',
    description: 'Revolutionary battery technology using organic compounds for long-term energy storage with 90% efficiency.',
    studentName: 'Arjun Sharma',
    studentEmail: 'arjun.sharma@example.com',
    category: 'CleanTech',
    targetAmount: 250000,
    raisedAmount: 175000,
    fundingGoal: 'Develop prototype and conduct pilot testing',
    businessModel: 'B2B SaaS with hardware component, subscription-based maintenance',
    marketSize: '$45B global energy storage market',
    competition: 'Tesla Powerwall, LG Chem batteries',
    teamSize: 4,
    timeline: '18 months to market',
    riskAssessment: 'Medium - technology proven in lab, regulatory approvals needed',
    investorsCount: 12,
    createdAt: '2024-01-15',
    status: 'active',
    tags: ['CleanTech', 'Energy', 'Hardware', 'B2B']
  },
  {
    id: '2',
    title: 'MedAI Diagnostics - AI-Powered Medical Imaging',
    description: 'Machine learning platform for early detection of cardiovascular diseases through retinal scans.',
    studentName: 'Priya Patel',
    studentEmail: 'priya.patel@example.com',
    category: 'HealthTech',
    targetAmount: 500000,
    raisedAmount: 320000,
    fundingGoal: 'FDA approval process and clinical trials',
    businessModel: 'Per-scan licensing to hospitals and clinics',
    marketSize: '$8.1B medical imaging AI market',
    competition: 'Google Health, Zebra Medical Vision',
    teamSize: 6,
    timeline: '24 months to FDA approval',
    riskAssessment: 'High - requires regulatory approval, clinical validation',
    investorsCount: 8,
    createdAt: '2024-02-01',
    status: 'active',
    tags: ['HealthTech', 'AI', 'Medical', 'B2B']
  },
  {
    id: '3',
    title: 'AgriDrone Pro - Precision Farming Drones',
    description: 'Autonomous drones for crop monitoring, pest detection, and precision spraying for small to medium farms.',
    studentName: 'Kiran Singh',
    studentEmail: 'kiran.singh@example.com',
    category: 'AgriTech',
    targetAmount: 150000,
    raisedAmount: 150000,
    fundingGoal: 'Scale manufacturing and expand to 5 states',
    businessModel: 'Direct sales with service contracts',
    marketSize: '$4.2B precision agriculture market',
    competition: 'DJI Agriculture, PrecisionHawk',
    teamSize: 3,
    timeline: '12 months to scale',
    riskAssessment: 'Low - proven technology, strong market demand',
    investorsCount: 15,
    createdAt: '2023-11-20',
    status: 'completed',
    tags: ['AgriTech', 'Hardware', 'Drones', 'B2B']
  },
  {
    id: '4',
    title: 'EduConnect - Rural Education Platform',
    description: 'Offline-first learning platform bringing quality education to remote areas with solar-powered tablets.',
    studentName: 'Sneha Gupta',
    studentEmail: 'sneha.gupta@example.com',
    category: 'EdTech',
    targetAmount: 100000,
    raisedAmount: 45000,
    fundingGoal: 'Pilot program in 10 villages',
    businessModel: 'B2G partnerships with government education departments',
    marketSize: '$350B global education technology market',
    competition: 'Khan Academy, BYJU\'S',
    teamSize: 5,
    timeline: '15 months to pilot completion',
    riskAssessment: 'Medium - government partnerships, logistics challenges',
    investorsCount: 6,
    createdAt: '2024-03-10',
    status: 'active',
    tags: ['EdTech', 'Social Impact', 'B2G', 'Mobile']
  },
  {
    id: '5',
    title: 'FinSecure - Blockchain Identity Verification',
    description: 'Decentralized identity verification system for financial institutions to prevent fraud.',
    studentName: 'Rohit Kumar',
    studentEmail: 'rohit.kumar@example.com',
    category: 'FinTech',
    targetAmount: 300000,
    raisedAmount: 89000,
    fundingGoal: 'MVP development and regulatory compliance',
    businessModel: 'Per-verification transaction fees',
    marketSize: '$16.7B identity verification market',
    competition: 'Jumio, Onfido, Trulioo',
    teamSize: 4,
    timeline: '20 months to market',
    riskAssessment: 'High - regulatory compliance, blockchain adoption',
    investorsCount: 4,
    createdAt: '2024-02-28',
    status: 'active',
    tags: ['FinTech', 'Blockchain', 'Security', 'B2B']
  }
];

export const mockInvestments: Investment[] = [
  { id: '1', fundraiserId: '1', investorName: 'Alumni Tech Fund', amount: 50000, date: '2024-01-20', type: 'equity' },
  { id: '2', fundraiserId: '1', investorName: 'Green Energy Ventures', amount: 75000, date: '2024-02-05', type: 'equity' },
  { id: '3', fundraiserId: '2', investorName: 'Healthcare Innovation Fund', amount: 100000, date: '2024-02-10', type: 'equity' },
  { id: '4', fundraiserId: '3', investorName: 'AgTech Partners', amount: 80000, date: '2023-12-01', type: 'equity' },
  { id: '5', fundraiserId: '4', investorName: 'Social Impact Collective', amount: 25000, date: '2024-03-15', type: 'grant' },
];