import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import {
  Appointment,
  AppointmentFilterRequest,
  AppointmentStatus,
  AvailableSlot,
  CreateAppointmentRequest,
} from '../models/appointment.model';
import { ApiResult } from '../models/auth.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.APPOINTMENTS.BASE).url;
  }

  private get availabilityUrl(): string {
    return this.factory.create(API_ROUTES.APPOINTMENTS.AVAILABILITY).url;
  }

  getAvailableSlots(date: string, serviceId: number, practitionerId: number): Observable<AvailableSlot[]> {
    const params = {
      date,
      serviceId: serviceId.toString(),
      practitionerId: practitionerId.toString(),
    };
    return this.http
      .get<ApiResult<AvailableSlot[]>>(this.availabilityUrl, { params })
      .pipe(map((res) => res.value ?? ([] as AvailableSlot[])));
  }

  create(request: CreateAppointmentRequest): Observable<ApiResult<Appointment>> {
    return this.http.post<ApiResult<Appointment>>(this.baseUrl, request);
  }

  getById(id: number): Observable<Appointment> {
    return this.http
      .get<ApiResult<Appointment>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.value!));
  }

  list(filter: AppointmentFilterRequest = {}): Observable<Appointment[]> {
    let params = new HttpParams();
    if (filter.date) params = params.set('date', filter.date);
    if (filter.serviceId) params = params.set('serviceId', filter.serviceId.toString());
    if (filter.practitionerId) params = params.set('practitionerId', filter.practitionerId.toString());
    if (filter.status) params = params.set('status', filter.status);

    return this.http
      .get<ApiResult<Appointment[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.value ?? ([] as Appointment[])));
  }

  updateStatus(id: number, status: AppointmentStatus): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.baseUrl}/${id}/status`, { status });
  }
}
