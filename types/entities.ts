
export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  registration_number: string;
  created_at: string;
  updated_at: string;
}

export interface Anomaly {
  timestamp_ms: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency_range: string;
}

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

export interface MechanicReport {
  id: string;
  analysis_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost: number;
  issue_summary: string;
  recommended_actions: string[];
  created_at: string;
}
