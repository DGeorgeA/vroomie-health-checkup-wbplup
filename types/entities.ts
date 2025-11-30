
export interface AudioAnalysis {
  id: string;
  vehicle_id: string;
  audio_file_url: string;
  duration_seconds: number;
  anomaly_detected: boolean;
  anomaly_score: number;
  anomalies: Anomaly[];
  created_at: string;
  detected_anomaly_name?: string;
}

export interface Anomaly {
  timestamp_ms: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency_range: string;
}

export interface AnomalyPattern {
  id: string;
  anomaly_name: string;
  audio_file_url: string;
  storage_path: string;
  upload_date: string;
  created_at: string;
}

export interface Session {
  id: string;
  timestamp: string;
  anomalyScore: number;
  anomalies: Anomaly[];
  detectedAnomalyName?: string;
  duration_seconds: number;
  audio_file_url?: string;
}
