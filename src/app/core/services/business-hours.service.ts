import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult } from '../models/auth.model';
import { BusinessHours, UpdateBusinessHoursRequest } from '../models/business-hours.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root',
})
export class BusinessHoursService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.BUSINESS_HOURS.BASE).url;
  }

  list(): Observable<BusinessHours[]> {
    return this.http
      .get<ApiResult<BusinessHours[]>>(this.baseUrl)
      .pipe(map((result) => result.value ?? ([] as BusinessHours[])));
  }

  updateAll(request: UpdateBusinessHoursRequest): Observable<ApiResult> {
    return this.http.put<ApiResult>(this.baseUrl, request);
  }
}
