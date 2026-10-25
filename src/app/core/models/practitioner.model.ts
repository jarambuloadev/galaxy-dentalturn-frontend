import { BaseEntity } from './base-entity.model';

export interface PractitionerServiceItem {
  id: number;
  name: string;
}

// Respuesta: GET /api/practitioners?pageNumber=1&pageSize=10&search=
// y GET /api/practitioners/{id}
export interface Practitioner extends BaseEntity {
  name: string;
  active: boolean;
  serviceIds: number[];
  services: PractitionerServiceItem[];
}

// Request: POST /api/practitioners
export interface CreatePractitionerRequest {
  name: string;
  active: boolean;
  serviceIds: number[];
}

// Request: PUT /api/practitioners/{id}
export interface UpdatePractitionerRequest {
  name: string;
  active: boolean;
  serviceIds: number[];
}
