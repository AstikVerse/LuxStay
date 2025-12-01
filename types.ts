export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string; // For mock auth
  roomNumber: string | null; // Null if not allocated
  course: string;
  year: number;
  phoneNumber: string;
  parentPhoneNumber: string;
  aadharNumber: string; // Unique ID
  dob: string; // YYYY-MM-DD
  // Financials
  totalFees: number;
  paidFees: number;
}

export interface Room {
  id: string;
  number: string;
  capacity: number;
  occupants: string[]; // Array of Student IDs
  type: 'Single' | 'Double' | 'Triple' | 'Suite';
  price: number;
  features: string[];
  floor: number;
  image: string;
}

export interface Grievance {
  id: string;
  studentId: string;
  category: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  timestamp: string;
  aiAnalysis?: string; // Analysis from Gemini
  priority?: 'Low' | 'Medium' | 'High';
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'Normal' | 'Urgent';
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}