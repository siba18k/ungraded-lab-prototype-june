import { Timestamp } from 'firebase/firestore';

export type UserRole = 'patient' | 'nurse' | 'doctor' | 'admin';
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CaseStatus =
  | 'pending_triage'
  | 'ai_assessed'
  | 'nurse_reviewed'
  | 'with_doctor'
  | 'consultation_complete'
  | 'closed';
export type NurseAction = 'confirmed' | 'adjusted' | 'escalated';

export interface Patient {
  uid: string;
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  email?: string;
  preferredLanguage: string;
  dateOfBirth: Timestamp;
  sex: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  primaryFacilityId: string;
  role: UserRole;
  consentGiven: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AIRecommendation {
  priorityLevel: PriorityLevel;
  riskScore: number;
  confidenceLevel: number;
  reasoningSummary: string;
  keyIndicators: string[];
  recommendedAction: string;
  generatedAt: Timestamp;
  modelUsed: string;
}

export interface NurseDecision {
  nurseId: string;
  action: NurseAction;
  adjustedPriority?: PriorityLevel;
  overrideReason?: string;
  overrideCategory?: string;
  notes?: string;
  decidedAt: Timestamp;
}

export interface DoctorConsultation {
  doctorId: string;
  diagnosis: string;
  treatmentPlan: string;
  prescriptions: string[];
  referralRequired: boolean;
  followUpDate?: Timestamp;
  notes: string;
  completedAt: Timestamp;
}

export interface TriageCase {
  caseId: string;
  patientId: string;
  facilityId: string;
  status: CaseStatus;
  symptomInput: {
    inputMethod: 'text' | 'voice';
    rawText: string;
    audioStoragePath?: string;
    submittedAt: Timestamp;
  };
  aiRecommendation?: AIRecommendation;
  nurseDecision?: NurseDecision;
  doctorConsultation?: DoctorConsultation;
  queuePosition?: number;
  estimatedWaitMins?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
