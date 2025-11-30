
import { Vehicle, AudioAnalysis, MechanicReport } from '@/types/entities';

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
];

export const mockAnalyses: AudioAnalysis[] = [
  {
    id: '1',
    vehicle_id: '1',
    audio_file_url: 'https://example.com/audio1.wav',
    duration_seconds: 45,
    anomaly_detected: true,
    anomaly_score: 78,
    anomalies: [
      {
        timestamp_ms: 12000,
        severity: 'high',
        frequency_range: '2000-3000 Hz',
      },
      {
        timestamp_ms: 28000,
        severity: 'medium',
        frequency_range: '1500-2500 Hz',
      },
    ],
    created_at: '2024-03-10T09:15:00Z',
  },
  {
    id: '2',
    vehicle_id: '2',
    audio_file_url: 'https://example.com/audio2.wav',
    duration_seconds: 60,
    anomaly_detected: false,
    anomaly_score: 15,
    anomalies: [],
    created_at: '2024-03-12T11:20:00Z',
  },
];

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
];
