
export interface AudioAnalysis {
  id: string;
  vehicle_id: string;
  audio_file_url: string;
  duration_seconds: number;
  anomaly_detected: boolean;
  anomaly_score: number;
  anomalies: Anomaly[];
  created_at: string;
}

export interface Anomaly {
  timestamp_ms: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency_range: string;
}
