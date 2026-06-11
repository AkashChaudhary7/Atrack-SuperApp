/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserState {
  isLocked: boolean;
  isAuthenticated: boolean;
  biometricActive: boolean;
  profiles: string[]; // ["Self", "Wife", "Other"]
  currentProfile: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  assetAccountId?: string; // deducted from this account
}

export interface AssetAccount {
  id: string;
  name: string;
  type: "liquid" | "fixed";
  category: "Savings Account" | "Cash" | "Stocks" | "Mutual Fund" | "Fixed Deposit" | "Bonds" | "Loan Given" | "Other";
  balance: number;
  updatedAt: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: "EMI" | "Insurance" | "Utility" | "Other";
  isPaid: boolean;
  reminderDays: number;
}

export interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // array of YYYY-MM-DD
  createdAt: string;
  streak: number;
}

export interface IntimacyLog {
  id: string;
  partnerName: string;
  date: string;
  mood: "Ecstatic" | "Playful" | "Tired" | "Satisfied" | "Wild";
  notes?: string;
}

export interface JerkOffLog {
  id: string;
  date: string; // YYYY-MM-DD
  count: number;
  sessions: number; // number of sessions
}

export interface Medicine {
  id: string;
  name: string;
  dosageDaily: number;
  totalPillsLeft: number;
  reminderTime: string; // "HH:MM"
  history: { [date: string]: number }; // tracks daily taken count
}

export interface WeightRecord {
  id: string;
  date: string;
  weight: number; // in kg or lbs
}

export interface WorkoutLog {
  id: string;
  type: "Squat" | "Kegel";
  reps: number;
  sets: number;
  date: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  date: string;
  isCompleted: boolean;
  type: "Study" | "Personal" | "Financial" | "Other";
}

export interface StudyFocusSession {
  id: string;
  date: string;
  durationMinutes: number; // minutes focused
  subject: string;
}

export interface SecurePassword {
  id: string;
  title: string;
  username: string;
  passwordEncrypted: string; // pseudo-encrypted hex
  url?: string;
  notes?: string;
  category: "Financial" | "Social" | "Work" | "Personal";
}

export interface SecureDocument {
  id: string;
  profileId: string; // "Self", "Wife", "Other"
  title: string;
  fileName: string;
  uploadedAt: string;
  fileDataEncrypted: string; // base64 mock encrypted payload
}

export interface DailyInsight {
  title: string;
  category: "Health" | "Finance" | "Habit";
  detail: string;
}

export interface PersonalID {
  id: string;
  idType: string; // e.g. "Passport", "Driver License", "Aadhaar Card", "PAN Card"
  idNumber: string;
  nameOnID: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  userId?: string;
  profileId?: string;
  title: string;
  category: "Financial" | "Skill Mastery" | "Other";
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
}
