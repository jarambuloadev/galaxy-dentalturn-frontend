import { BaseEntity } from './base-entity.model';

// Respuesta: GET /api/adminusers?pageNumber=1&pageSize=10&search=
// y GET /api/adminusers/{id}
export interface AdminUserItem extends BaseEntity {
  name: string;
  email: string;
  rol: string;
  active: boolean;
}

// Request: POST /api/adminusers
export interface CreateAdminUserRequest {
  name: string;
  email: string;
  passwordHash: string;
  rol: string;
}

// Request: PUT /api/adminusers/{id}
export interface UpdateAdminUserRequest {
  name: string;
  email: string;
  passwordHash?: string;
  rol: string;
}
