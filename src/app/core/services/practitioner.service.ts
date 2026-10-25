import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { PagedRequest } from '../models/paged.model';
import {
  CreatePractitionerRequest,
  Practitioner,
  UpdatePractitionerRequest,
} from '../models/practitioner.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root',
})
export class PractitionerService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.PRACTITIONERS.BASE).url;
  }

  list(request: PagedRequest): Observable<Practitioner[]> {
    const params = {
      pageNumber: request.pageNumber.toString(),
      pageSize: request.pageSize.toString(),
      search: request.search || '',
    };
    return this.http
      .get<ApiResult<Practitioner[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? ([] as Practitioner[])));
  }

  getById(id: number): Observable<Practitioner> {
    return this.http
      .get<ApiResult<Practitioner>>(`${this.baseUrl}/${id}`)
      .pipe(map((result) => result.value!));
  }

  create(request: CreatePractitionerRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(this.baseUrl, request);
  }

  update(id: number, request: UpdatePractitionerRequest): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResult> {
    return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
  }
}
