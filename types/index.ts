export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface HealthEntry {
  id: string;
  date: string;
  mood: string;
  waterIntake: number;
  exercise: string;
  sleepHours: number;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  type: 'WATER' | 'SLEEP' | 'STEPS' | 'CUSTOM';
  targetValue: number;
  currentValue: number;
  unit: string;
}

export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
}
