import { Room, Student, Role, User, Notice, LeaveRequest } from './types';

// Helper to get today's date in YYYY-MM-DD for the demo birthday
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

export const INITIAL_ROOMS: Room[] = [
  // Floor 1
  {
    id: 'r101',
    number: '101',
    capacity: 1,
    occupants: [],
    type: 'Single',
    price: 1500,
    features: ['Ocean View', 'King Bed', 'Smart TV'],
    floor: 1,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'r102',
    number: '102',
    capacity: 2,
    occupants: ['s1'],
    type: 'Double',
    price: 900,
    features: ['Garden View', 'Study Desk', 'Ensuite'],
    floor: 1,
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'r103',
    number: '103',
    capacity: 3,
    occupants: ['s2', 's3', 's4'], // Full
    type: 'Triple',
    price: 600,
    features: ['Bunk Beds', 'Shared Lounge', 'High-Speed Wifi'],
    floor: 1,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'r104',
    number: '104',
    capacity: 3,
    occupants: ['s5'],
    type: 'Triple',
    price: 600,
    features: ['Standard View', 'Storage Lockers'],
    floor: 1,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000'
  },
  // Floor 2
  {
    id: 'r201',
    number: '201',
    capacity: 1,
    occupants: [],
    type: 'Suite',
    price: 2000,
    features: ['Private Balcony', 'Jacuzzi', 'Kitchenette'],
    floor: 2,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'r202',
    number: '202',
    capacity: 2,
    occupants: [],
    type: 'Double',
    price: 1100,
    features: ['City View', 'Ergonomic Chairs'],
    floor: 2,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'r203',
    number: '203',
    capacity: 2,
    occupants: [],
    type: 'Double',
    price: 1100,
    features: ['City View', 'Ergonomic Chairs'],
    floor: 2,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000'
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // Setting Alice's birthday to TODAY so you can see the email automation
  { id: 's1', name: 'Alice Johnson', email: 'alice@univ.edu', password: 'password', roomNumber: '102', course: 'Computer Science', year: 2, phoneNumber: '555-0101', parentPhoneNumber: '555-0102', aadharNumber: '1234-5678-9012', totalFees: 5000, paidFees: 5000, dob: todayStr },
  { id: 's2', name: 'Bob Smith', email: 'bob@univ.edu', password: 'password', roomNumber: '103', course: 'Engineering', year: 1, phoneNumber: '555-0103', parentPhoneNumber: '555-0104', aadharNumber: '2345-6789-0123', totalFees: 5000, paidFees: 2500, dob: '2004-05-15' },
  { id: 's3', name: 'Charlie Brown', email: 'charlie@univ.edu', password: 'password', roomNumber: '103', course: 'Arts', year: 3, phoneNumber: '555-0105', parentPhoneNumber: '555-0106', aadharNumber: '3456-7890-1234', totalFees: 4500, paidFees: 0, dob: '2002-12-01' },
  { id: 's4', name: 'David Lee', email: 'david@univ.edu', password: 'password', roomNumber: '103', course: 'Business', year: 2, phoneNumber: '555-0107', parentPhoneNumber: '555-0108', aadharNumber: '4567-8901-2345', totalFees: 5000, paidFees: 4800, dob: '2003-08-20' },
  { id: 's5', name: 'Eva Green', email: 'eva@univ.edu', password: 'password', roomNumber: '104', course: 'Physics', year: 4, phoneNumber: '555-0109', parentPhoneNumber: '555-0110', aadharNumber: '5678-9012-3456', totalFees: 4500, paidFees: 4500, dob: '2001-03-10' },
  { id: 's6', name: 'Frank White', email: 'frank@univ.edu', password: 'password', roomNumber: null, course: 'Math', year: 1, phoneNumber: '555-0111', parentPhoneNumber: '555-0112', aadharNumber: '6789-0123-4567', totalFees: 5000, paidFees: 1000, dob: '2005-01-05' },
  { id: 's7', name: 'Grace Hall', email: 'grace@univ.edu', password: 'password', roomNumber: null, course: 'Biology', year: 2, phoneNumber: '555-0113', parentPhoneNumber: '555-0114', aadharNumber: '7890-1234-5678', totalFees: 5000, paidFees: 5000, dob: '2003-11-22' },
  { id: 's8', name: 'Henry Ford', email: 'henry@univ.edu', password: 'password', roomNumber: null, course: 'Engineering', year: 1, phoneNumber: '555-0115', parentPhoneNumber: '555-0116', aadharNumber: '8901-2345-6789', totalFees: 5000, paidFees: 0, dob: '2004-06-30' },
  { id: 's9', name: 'Ivy Chen', email: 'ivy@univ.edu', password: 'password', roomNumber: null, course: 'Chemistry', year: 3, phoneNumber: '555-0117', parentPhoneNumber: '555-0118', aadharNumber: '9012-3456-7890', totalFees: 4500, paidFees: 3000, dob: '2002-09-14' },
];

export const INITIAL_NOTICES: Notice[] = [
  { id: 'n1', title: 'Gym Maintenance', content: 'The gym will be closed for upgrades this weekend.', date: '2023-10-25', priority: 'Normal' },
  { id: 'n2', title: 'Fee Deadline', content: 'Final date for semester fee payment is Nov 1st.', date: '2023-10-20', priority: 'Urgent' }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'l1', studentId: 's1', reason: 'Visiting parents for weekend', startDate: '2023-11-03', endDate: '2023-11-05', status: 'Pending' },
  { id: 'l2', studentId: 's2', reason: 'Medical Checkup', startDate: '2023-10-28', endDate: '2023-10-28', status: 'Approved' }
];

export const MOCK_ADMIN: User & { password?: string } = {
  id: 'admin1',
  name: 'Warden Anderson',
  email: 'warden@luxstay.com',
  password: 'admin123', // Hardcoded for demo
  role: Role.ADMIN
};

export const MOCK_STUDENT_USER: User = {
  id: 's1',
  name: 'Alice Johnson',
  email: 'alice@univ.edu',
  role: Role.STUDENT
};