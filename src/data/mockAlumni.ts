export interface Alumni {
  id: string;
  name: string;
  email: string;
  graduationYear: number;
  program: string;
  department: string;
  currentJobTitle: string;
  company: string;
  skills: string[];
  location: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  profilePicture?: string;
  linkedinUrl?: string;
  registrationDate: string;
  notes?: string;
}

export const mockAlumni: Alumni[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    graduationYear: 2020,
    program: 'Computer Science',
    department: 'Engineering',
    currentJobTitle: 'Senior Software Engineer',
    company: 'Google',
    skills: ['React', 'Node.js', 'Python', 'Machine Learning'],
    location: 'San Francisco, CA',
    verificationStatus: 'approved',
    registrationDate: '2024-01-15',
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    graduationYear: 2019,
    program: 'Business Administration',
    department: 'Business',
    currentJobTitle: 'Product Manager',
    company: 'Microsoft',
    skills: ['Product Strategy', 'Data Analysis', 'Leadership', 'Agile'],
    location: 'Seattle, WA',
    verificationStatus: 'pending',
    registrationDate: '2024-02-01',
    notes: 'Need to verify graduation records'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    graduationYear: 2021,
    program: 'Marketing',
    department: 'Business',
    currentJobTitle: 'Digital Marketing Manager',
    company: 'Adobe',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    location: 'Austin, TX',
    verificationStatus: 'approved',
    registrationDate: '2024-01-28'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    graduationYear: 2018,
    program: 'Mechanical Engineering',
    department: 'Engineering',
    currentJobTitle: 'Engineering Manager',
    company: 'Tesla',
    skills: ['CAD Design', 'Project Management', 'Manufacturing', 'Leadership'],
    location: 'Palo Alto, CA',
    verificationStatus: 'approved',
    registrationDate: '2024-01-10'
  },
  {
    id: '5',
    name: 'Jessica Brown',
    email: 'jessica.brown@email.com',
    graduationYear: 2022,
    program: 'Data Science',
    department: 'Engineering',
    currentJobTitle: 'Data Scientist',
    company: 'Netflix',
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
    location: 'Los Gatos, CA',
    verificationStatus: 'pending',
    registrationDate: '2024-02-10',
    notes: 'Recent graduate, pending documentation'
  },
  {
    id: '6',
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    graduationYear: 2017,
    program: 'Finance',
    department: 'Business',
    currentJobTitle: 'Investment Analyst',
    company: 'Goldman Sachs',
    skills: ['Financial Analysis', 'Risk Management', 'Excel', 'Bloomberg'],
    location: 'New York, NY',
    verificationStatus: 'approved',
    registrationDate: '2024-01-05'
  }
];

export const mockEvents = [
  {
    id: '1',
    title: 'Annual Alumni Networking Event',
    date: '2024-03-15',
    location: 'University Campus',
    description: 'Join fellow alumni for networking and career discussions',
    attendees: 45,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Tech Career Workshop',
    date: '2024-02-28',
    location: 'Virtual',
    description: 'Career guidance for tech professionals',
    attendees: 32,
    status: 'completed'
  },
  {
    id: '3',
    title: 'Mentorship Program Launch',
    date: '2024-04-10',
    location: 'University Campus',
    description: 'Launch of the new alumni mentorship program',
    attendees: 0,
    status: 'upcoming'
  }
];