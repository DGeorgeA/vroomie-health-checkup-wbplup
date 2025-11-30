
import { AudioAnalysis } from '@/types/entities';

// Helper function to generate realistic anomalies
const generateAnomalies = (count: number, durationSeconds: number) => {
  const anomalies = [];
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = [];
  
  // Build severity distribution: 25% low, 50% medium, 20% high, 5% critical
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

// Generate sample AudioAnalysis records
export const mockAnalyses: AudioAnalysis[] = [
  {
    id: '1',
    vehicle_id: 'default',
    audio_file_url: 'https://example.com/audio/checkup-001.wav',
    duration_seconds: 45,
    anomaly_detected: true,
    anomaly_score: 78,
    anomalies: generateAnomalies(3, 45),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    vehicle_id: 'default',
    audio_file_url: 'https://example.com/audio/checkup-002.wav',
    duration_seconds: 60,
    anomaly_detected: false,
    anomaly_score: 15,
    anomalies: [],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    vehicle_id: 'default',
    audio_file_url: 'https://example.com/audio/checkup-003.wav',
    duration_seconds: 52,
    anomaly_detected: true,
    anomaly_score: 92,
    anomalies: generateAnomalies(4, 52),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    vehicle_id: 'default',
    audio_file_url: 'https://example.com/audio/checkup-004.wav',
    duration_seconds: 38,
    anomaly_detected: true,
    anomaly_score: 65,
    anomalies: generateAnomalies(2, 38),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    vehicle_id: 'default',
    audio_file_url: 'https://example.com/audio/checkup-005.wav',
    duration_seconds: 30,
    anomaly_detected: false,
    anomaly_score: 8,
    anomalies: [],
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    vehicle_id: 'default',
    audio_file_url: 'https://example.com/audio/checkup-006.wav',
    duration_seconds: 55,
    anomaly_detected: true,
    anomaly_score: 85,
    anomalies: generateAnomalies(3, 55),
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Keep empty reports array for future use
export const mockReports: any[] = [];

// Keep empty vehicles array for compatibility
export const mockVehicles: any[] = [];
