// School Types
// Defines the core data structures for school-related functionality

/**
 * Represents a school entity in the system
 */
export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  status: 'Opened' | 'Closed' | 'Under Review';
  gradeRange: string[];
  tags: string[];
  parentOrganization: string;
  phone: string;
  currentEnrollment: number;
  webSite: string;
  operationDetails: {
    studentCapacity: number;
    classSize: number;
    teacherToStudentRatio: string;
    transportationProvided: boolean;
    lunchProvided: boolean;
    availableMealOptions: string[];
    financialAidAvailable: boolean;
  };
}

/**
 * Represents an escalation item for tracking school issues
 */
export interface EscalationItem {
  id: string;
  createdAt: string;
  createdBy: string;
  schoolName: string;
  heading: string;
  category: string;
  severityLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  active: boolean;
}

/**
 * Defines the possible intervention levels for schools
 * Ordered from least to most severe
 */
export type InterventionLevel = 
  | 'Informal Contact'
  | 'Initial Contact' 
  | 'Improvement Plan'
  | 'Notice of Concern'
  | 'Revocation of Contract / Non-Renewal';
