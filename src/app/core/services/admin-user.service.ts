import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import {
  AdminUserItem,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from '../models/admin-user.model';
import { ApiResult } from '../models/auth.model';
import { PagedRequest } from '../models/paged.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.ADMIN_USERS.BASE).url;
  }

  list(request: PagedRequest): Observable<AdminUserItem[]> {
    const params = {
      pageNumber: request.pageNumber.toString(),
      pageSize: request.pageSize.toString(),
      search: request.search || '',
    };
    return this.http
      .get<ApiResult<AdminUserItem[]>>(this.baseUrl, { params })
      .pipe(map((result) => result.value ?? ([] as AdminUserItem[])));
  }

  getById(id: number): Observable<AdminUserItem> {
    return this.http
      .get<ApiResult<AdminUserItem>>(`${this.baseUrl}/${id}`)
      .pipe(map((result) => result.value!));
  }

  create(request: CreateAdminUserRequest): Observable<ApiResult> {
    return this.http.post<ApiResult>(this.baseUrl, request);
  }

  update(id: number, request: UpdateAdminUserRequest): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResult> {
    return this.http.delete<ApiResult>(`${this.baseUrl}/${id}`);
  }
}
