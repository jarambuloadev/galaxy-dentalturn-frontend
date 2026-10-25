import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServiceFactory } from './api-service-factory';
import { API_ROUTES } from '../constants/api-routes.constants';
import { map, Observable } from 'rxjs';
import { CreateServiceRequest, Service, UpdateServiceRequest } from '../models/service.model';
import { PagedRequest } from '../models/paged.model';
import { ApiResult } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.SERVICES.BASE).url;
  }

  list(request: PagedRequest): Observable<Service[]> {
    const params = {
      pageNumber: request.pageNumber.toString(),
      pageSize: request.pageSize.toString(),
      search: request.search || '',
    };
    return this.http
      .get<ApiResult<Service[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? ([] as Service[])));
  }

  getById(id: number): Observable<Service> {
    return this.http
      .get<ApiResult<Service>>(`${this.baseUrl}/${id}`)
      .pipe(map((result) => result.value!));
  }

  create(request: CreateServiceRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(this.baseUrl, request);
  }

  update(id: number, request: UpdateServiceRequest): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResult> {
    return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
  }
}
