import {BaseEntity} from "./base-entity.model";

//respuesta del listado: GET /api/services?PageNumber=1&PageSize=10&Search=
export interface Service extends BaseEntity {
  name: string;
  description: string;
  durationMin: number;
  active: number;
}

//Request : POST /api/services
export interface CreateServiceRequest extends BaseEntity {
  name: string;
  description: string;
  durationMin: number;
  active: number;
}

//Request : PUT /api/services/{id}
export interface UpdateServiceRequest extends BaseEntity {
  name: string;
  description: string;
  durationMin: number;
  active: number;
}