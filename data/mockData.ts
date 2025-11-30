
import { Vehicle, AudioAnalysis, MechanicReport } from '@/types/entities';

// Generate 5 sample vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    user_id: 'user1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    registration_number: 'ABC-1234',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    registration_number: 'XYZ-5678',
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    user_id: 'user1',
    make: 'Ford',
    model: 'F-150',
    year: 2021,
    registration_number: 'DEF-9012',
    created_at: '2024-03-05T09:15:00Z',
    updated_at: '2024-03-05T09:15:00Z',
  },
  {
    id: '4',
    user_id: 'user1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    registration_number: 'GHI-3456',
    created_at: '2024-04-10T16:45:00Z',
    updated_at: '2024-04-10T16:45:00Z',
  },
  {
    id: '5',
    user_id: 'user1',
    make: 'BMW',
    model: '3 Series',
    year: 2018,
    registration_number: 'JKL-7890',
    created_at: '2024-05-22T11:20:00Z',
    updated_at: '2024-05-22T11:20:00Z',
  },
];

// Helper function to generate realistic anomalies
// Severity distribution: 25% low, 50% medium, 20% high, 5% critical
const generateAnomalies = (count: number, durationSeconds: number) => {
  const anomalies = [];
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = [];
  
  // Build severity distribution
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    if (rand < 0.25) severities.push('low');
    else if (rand < 0.75) severities.push('medium');
    else if (rand < 0.95) severities.push('high');
    else severities.push('critical');
  }
  
  for (let i = 0; i < count; i++) {
    const timestamp_ms = Math.floor(Math.random() * durationSeconds * 1000);
    const freqStart = Math.floor(1000 + Math.random() * 7000); // 1-8kHz
    const freqEnd = freqStart + Math.floor(500 + Math.random() * 1500);
    
    anomalies.push({
      timestamp_ms,
      severity: severities[i],
      frequency_range: `${freqStart}-${freqEnd} Hz`,
    });
  }
  
  // Sort by timestamp
  return anomalies.sort((a, b) => a.timestamp_ms - b.timestamp_ms);
};

// Generate 8 sample AudioAnalysis records
export const mockAnalyses: AudioAnalysis[] = [
  {
    id: '1',
    vehicle_id: '1',
    audio_file_url: 'https://example.com/audio/toyota-camry-001.wav',
    duration_seconds: 45,
    anomaly_detected: true,
    anomaly_score: 78,
    anomalies: generateAnomalies(3, 45),
    created_at: '2024-03-10T09:15:00Z',
  },
  {
    id: '2',
    vehicle_id: '2',
    audio_file_url: 'https://example.com/audio/honda-civic-001.wav',
    duration_seconds: 60,
    anomaly_detected: false,
    anomaly_score: 15,
    anomalies: [],
    created_at: '2024-03-12T11:20:00Z',
  },
  {
    id: '3',
    vehicle_id: '3',
    audio_file_url: 'https://example.com/audio/ford-f150-001.wav',
    duration_seconds: 52,
    anomaly_detected: true,
    anomaly_score: 92,
    anomalies: generateAnomalies(4, 52),
    created_at: '2024-03-15T14:30:00Z',
  },
  {
    id: '4',
    vehicle_id: '1',
    audio_file_url: 'https://example.com/audio/toyota-camry-002.wav',
    duration_seconds: 38,
    anomaly_detected: true,
    anomaly_score: 65,
    anomalies: generateAnomalies(2, 38),
    created_at: '2024-03-18T10:45:00Z',
  },
  {
    id: '5',
    vehicle_id: '4',
    audio_file_url: 'https://example.com/audio/tesla-model3-001.wav',
    duration_seconds: 30,
    anomaly_detected: false,
    anomaly_score: 8,
    anomalies: [],
    created_at: '2024-03-20T16:00:00Z',
  },
  {
    id: '6',
    vehicle_id: '5',
    audio_file_url: 'https://example.com/audio/bmw-3series-001.wav',
    duration_seconds: 55,
    anomaly_detected: true,
    anomaly_score: 85,
    anomalies: generateAnomalies(3, 55),
    created_at: '2024-03-22T13:15:00Z',
  },
  {
    id: '7',
    vehicle_id: '3',
    audio_file_url: 'https://example.com/audio/ford-f150-002.wav',
    duration_seconds: 48,
    anomaly_detected: true,
    anomaly_score: 72,
    anomalies: generateAnomalies(2, 48),
    created_at: '2024-03-25T09:30:00Z',
  },
  {
    id: '8',
    vehicle_id: '2',
    audio_file_url: 'https://example.com/audio/honda-civic-002.wav',
    duration_seconds: 42,
    anomaly_detected: false,
    anomaly_score: 22,
    anomalies: [],
    created_at: '2024-03-28T15:45:00Z',
  },
];

// Generate 6 MechanicReport records for analyses with anomaly_detected = true
const anomalyAnalyses = mockAnalyses.filter(a => a.anomaly_detected);

export const mockReports: MechanicReport[] = [
  {
    id: '1',
    analysis_id: '1',
    severity: 'high',
    estimated_cost: 450,
    issue_summary: 'Worn brake pads detected. High-frequency squealing indicates immediate attention required.',
    recommended_actions: [
      'Replace front brake pads',
      'Inspect brake rotors for damage',
      'Check brake fluid level',
      'Test brake system after repair',
    ],
    created_at: '2024-03-10T09:30:00Z',
  },
  {
    id: '2',
    analysis_id: '3',
    severity: 'critical',
    estimated_cost: 1200,
    issue_summary: 'Severe engine knocking detected at multiple frequency ranges. Possible bearing failure or timing chain issues.',
    recommended_actions: [
      'Immediate engine inspection required',
      'Check engine oil level and quality',
      'Inspect timing chain and tensioners',
      'Evaluate main and rod bearings',
      'Do not drive until inspected',
    ],
    created_at: '2024-03-15T14:45:00Z',
  },
  {
    id: '3',
    analysis_id: '4',
    severity: 'medium',
    estimated_cost: 280,
    issue_summary: 'Belt squeal detected during acceleration. Likely serpentine belt wear or misalignment.',
    recommended_actions: [
      'Inspect serpentine belt for wear',
      'Check belt tensioner operation',
      'Verify pulley alignment',
      'Replace belt if cracked or glazed',
    ],
    created_at: '2024-03-18T11:00:00Z',
  },
  {
    id: '4',
    analysis_id: '6',
    severity: 'high',
    estimated_cost: 650,
    issue_summary: 'Exhaust system leak detected. Abnormal resonance patterns suggest catalytic converter or manifold issues.',
    recommended_actions: [
      'Inspect exhaust manifold for cracks',
      'Check catalytic converter integrity',
      'Examine exhaust gaskets and seals',
      'Verify oxygen sensor readings',
      'Repair or replace damaged components',
    ],
    created_at: '2024-03-22T13:30:00Z',
  },
  {
    id: '5',
    analysis_id: '7',
    severity: 'medium',
    estimated_cost: 320,
    issue_summary: 'Valve train noise detected. Possible lifter tick or valve clearance issues.',
    recommended_actions: [
      'Check engine oil level and viscosity',
      'Inspect hydraulic lifters',
      'Measure valve clearances',
      'Consider oil change with high-quality synthetic',
    ],
    created_at: '2024-03-25T09:45:00Z',
  },
  {
    id: '6',
    analysis_id: '1',
    severity: 'high',
    estimated_cost: 480,
    issue_summary: 'Follow-up analysis confirms brake system degradation. Additional wear patterns detected.',
    recommended_actions: [
      'Complete brake system overhaul',
      'Replace all brake pads and rotors',
      'Flush and replace brake fluid',
      'Inspect brake calipers for seizure',
    ],
    created_at: '2024-03-26T10:15:00Z',
  },
];
