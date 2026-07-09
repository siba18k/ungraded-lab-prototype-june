import { Timestamp } from 'firebase/firestore'

export type StaffRole = 'nurse' | 'doctor' | 'admin'

export type StaffStatus = 'active' | 'pending' | 'suspended'

export interface StaffMember {
    uid: string
    name: string
    fullName: string
    email: string
    role: StaffRole
    status: StaffStatus
    facilityId: string
    facilityName: string
}

export type UserRole = 'patient' | 'nurse' | 'doctor' | 'admin'
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type CaseStatus =
    | 'pending_triage'
    | 'ai_assessed'
    | 'nurse_reviewed'
    | 'with_doctor'
    | 'consultation_complete'
    | 'closed'

export type NurseAction = 'confirmed' | 'adjusted' | 'escalated'

export interface Patient {
    uid: string
    fullName: string
    idNumber: string
    phoneNumber: string
    email?: string
    preferredLanguage: string
    dateOfBirth: Timestamp
    sex: 'male' | 'female' | 'other'
    bloodType?: string
    allergies: string[]
    chronicConditions: string[]
    currentMedications: string[]
    emergencyContact: {
        name: string
        phone: string
        relationship: string
    }
    primaryFacilityId: string
    role: UserRole
    consentGiven: boolean
    createdAt: Timestamp
    updatedAt: Timestamp
}
