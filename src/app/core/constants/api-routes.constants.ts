export const API_ROUTES = {
  AUTH: {
    LOGIN: 'api/auth/login',
  },
  SERVICES: {
    BASE: 'api/services',
    GET_BY_ID: (id: number) => `api/services/${id}`,
    CREATE: 'api/services',
    UPDATE: (id: number) => `api/services/${id}`,
    DELETE: (id: number) => `api/services/${id}`,
  },
  BUSINESS_HOURS: {
    BASE: 'api/business-hours',
  },
  PATIENTS: {
    GET_ALL: 'users',
    GET_BY_ID: (id: number) => `users/${id}`,
    CREATE: 'users',
    UPDATE: (id: number) => `users/${id}`,
    DELETE: (id: number) => `users/${id}`,
  },
};
