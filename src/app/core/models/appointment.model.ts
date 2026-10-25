export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  label: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceId: number;
  serviceName: string;
  practitionerId: number;
  practitionerName: string;
  date: string;
  dateLabel: string;
  timeLabel: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface CreateAppointmentRequest {
  name: string;
  email: string;
  phone: string;
  serviceId: number;
  practitionerId: number;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm" or ISO
  notes?: string;
}

export interface AppointmentFilterRequest {
  date?: string;
  serviceId?: number | null;
  practitionerId?: number | null;
  status?: AppointmentStatus | '';
}
