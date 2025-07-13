export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type AttackType =
  | 'Malware'
  | 'Phishing'
  | 'DDoS'
  | 'Exploit'
  | 'InsiderThreat'
  | 'Physical'
  | 'SupplyChain'
  | 'WebAttack'
  | 'AccountCompromise'
  | 'DataBreach'
  | 'Ransomware'; // Added a specific Ransomware category

export interface Threat {
  id: string;
  title: string;
  description: string;
  severity: Severity; // Using the type alias
  location: {
    lat: number;
    lng: number;
    country: string;
    city: string;
  };
  timestamp: string;
  affectedSystems: string[];
  attackType: AttackType; // Using the new AttackType enum
  source: string;
}

export interface ThreatsResponse {
  threats: Threat[];
  total: number;
  lastUpdated: string;
}