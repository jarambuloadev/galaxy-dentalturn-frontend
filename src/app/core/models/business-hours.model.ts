import { BaseEntity } from './base-entity.model';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

// Orden de visualización: lunes a domingo (0=domingo..6=sábado)
export const DISPLAY_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

// Respuesta: GET /api/business-hours
export interface BusinessHours extends BaseEntity {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface DayHoursItemRequest {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

// Request: PUT /api/business-hours
export interface UpdateBusinessHoursRequest {
  days: DayHoursItemRequest[];
}
