
export type RiskLevel = 'low' | 'medium' | 'high';

export interface CallRecord {
  id: string;
  phoneNumber: string;
  timestamp: string;
  duration: number; // in seconds
  location?: string;
  callerName?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  source?: 'manual' | 'system';
}

export interface AnalysisResult {
  id: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  isGenuine: boolean;
  reasoning: string;
  threatCategory?: 'Spam' | 'Phishing' | 'Telemarketing' | 'Safe' | 'Identity Theft' | 'Verified Business';
  indicators: string[]; // Specific flags like "VoIP", "Spoofed", etc.
}

export interface CallLogAnalysis {
  results: AnalysisResult[];
}
