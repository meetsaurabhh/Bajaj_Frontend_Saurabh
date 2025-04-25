export interface Doctor {
  id: string;
  name: string;
  specialties: string[];
  experience: number;
  fee: number;
  consultationType: 'Video Consult' | 'In Clinic';
}

export interface FilterState {
  searchQuery: string;
  consultationType: 'Video Consult' | 'In Clinic' | null;
  specialties: string[];
  sortBy: 'fees' | 'experience' | null;
} 