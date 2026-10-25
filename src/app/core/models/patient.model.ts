import { BaseEntity } from './base-entity.model';

// Respuesta: GET /api/patients?pageNumber=1&pageSize=10&search=
// y GET /api/patients/{id}
export interface PatientItem extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  active: boolean;
}

// Request: POST /api/patients
export interface CreatePatientRequest {
  name: string;
  email: string;
  phone: string;
}

// Request: PUT /api/patients/{id}
export interface UpdatePatientRequest {
  name: string;
  email: string;
  phone: string;
}
