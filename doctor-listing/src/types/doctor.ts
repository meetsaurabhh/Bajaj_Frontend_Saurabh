export interface Doctor {
  id: number;
  name: string;
  specialties: string[];
  experience: number;
  fee: number;
  consultationType: 'Video Consult' | 'In Clinic';
  imageUrl?: string;
  qualification: string;
  clinicName: string;
  location: string;
}

export interface FilterState {
  searchQuery: string;
  consultationType: 'Video Consult' | 'In Clinic' | null;
  specialties: string[];
  sortBy: 'fees' | 'experience' | null;
} 