import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface EnpointConfig {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiServiceFactory {
  private readonly baseUrl = environment.apiUrl;

  create(apiPath: string): EnpointConfig {
    return { url: `${this.baseUrl}/${apiPath}` };
  }
}
