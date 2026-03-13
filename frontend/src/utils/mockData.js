export const CURRENT_USER = {
  id: 'u1',
  name: 'Sankalp',
  role: 'faculty',
  avatar: 'SS',
  branch: 'CSE',
  year: 'Faculty'
};

export const CHANNELS = [
  { id: 'c1', name: 'CSE 3rd Year', type: 'general', unread: 0 },
  { id: 'c2', name: 'DBMS', type: 'subject', unread: 3 },
  { id: 'c3', name: 'Cyber Security', type: 'subject', unread: 1 },
  { id: 'c4', name: 'TOC', type: 'subject', unread: 0 },
  { id: 'c5', name: 'Project Group Alpha', type: 'group', unread: 2 },
  { id: 'c7', name: 'Announcements', type: 'admin', unread: 1 },
];

export const MOCK_MESSAGES = [
  {
    id: 1,
    sender: { name: 'Prof. Ichchha Shrivastava', role: 'faculty', avatar: 'IS' },
    content: 'Midterm exams 5th Nov se shuru honge. Schedule notice board par hai.',
    timestamp: '9:30 AM',
    type: 'announcement'
  },
  {
    id: 2,
    sender: { name: 'Prof. Manoj Chauhan', role: 'faculty', avatar: 'MC' },
    content: 'DBMS Lab File complete karke lana kal.',
    timestamp: '10:15 AM',
    type: 'assignment',
    deadline: '28th Feb, 2026' // Backend field added
  },
  {
    id: 3,
    sender: { name: 'HOD Office', role: 'faculty', avatar: 'HO' },
    content: 'URGENT: Fee submission last date is tomorrow. Late fees will be applicable after 5 PM.',
    timestamp: '11:00 AM',
    type: 'alert' // New Backend Type
  },
  {
    id: 4,
    sender: { name: 'Sankalp', role: 'student', avatar: 'SS' },
    content: "Haan maine fees bhar di hai.",
    timestamp: '11:05 AM',
    type: 'text',
    isMe: true
  }
];