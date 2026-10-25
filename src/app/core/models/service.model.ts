import { BaseEntity } from './base-entity.model';

// Respuesta del listado: GET /api/services?pageNumber=1&pageSize=10&search=
export interface Service extends BaseEntity {
  name: string;
  description: string;
  durationMin: number;
  active: boolean;
}

// Request : POST /api/services
export interface CreateServiceRequest {
  name: string;
  description: string;
  durationMin: number;
  active?: boolean;
}

// Request : PUT /api/services/{id}
export interface UpdateServiceRequest {
  name: string;
  description: string;
  durationMin: number;
  active?: boolean;
}
