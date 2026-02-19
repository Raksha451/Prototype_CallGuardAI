
import { CallRecord } from './types';

export const MOCK_CALLS: CallRecord[] = [
  {
    id: '1',
    phoneNumber: '+1-800-123-4567',
    timestamp: '2024-05-20T10:30:00Z',
    duration: 120,
    location: 'New York, USA',
    callerName: 'Chase Bank Support',
    type: 'incoming'
  },
  {
    id: '2',
    phoneNumber: '+44-7911-123456',
    timestamp: '2024-05-20T11:15:00Z',
    duration: 5,
    location: 'London, UK',
    type: 'incoming'
  },
  {
    id: '3',
    phoneNumber: '+91-98765-43210',
    timestamp: '2024-05-20T12:00:00Z',
    duration: 0,
    location: 'Mumbai, India',
    type: 'missed'
  },
  {
    id: '4',
    phoneNumber: '+1-415-555-0199',
    timestamp: '2024-05-20T14:45:00Z',
    duration: 350,
    location: 'San Francisco, USA',
    callerName: 'Sarah Jenkins (Work)',
    type: 'outgoing'
  },
  {
    id: '5',
    phoneNumber: '+234-803-000-0000',
    timestamp: '2024-05-20T16:20:00Z',
    duration: 12,
    location: 'Lagos, Nigeria',
    type: 'incoming'
  },
  {
    id: '6',
    phoneNumber: 'Unknown',
    timestamp: '2024-05-20T18:10:00Z',
    duration: 45,
    location: 'Unknown',
    type: 'incoming'
  }
];
