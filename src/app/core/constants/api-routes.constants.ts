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
  PRACTITIONERS: {
    BASE: 'api/practitioners',
    GET_BY_ID: (id: number) => `api/practitioners/${id}`,
    CREATE: 'api/practitioners',
    UPDATE: (id: number) => `api/practitioners/${id}`,
    DELETE: (id: number) => `api/practitioners/${id}`,
  },
  BUSINESS_HOURS: {
    BASE: 'api/business-hours',
  },
  APPOINTMENTS: {
    BASE: 'api/appointments',
    AVAILABILITY: 'api/appointments/availability',
    GET_BY_ID: (id: number) => `api/appointments/${id}`,
    UPDATE_STATUS: (id: number) => `api/appointments/${id}/status`,
  },
  PATIENTS: {
    GET_ALL: 'users',
    GET_BY_ID: (id: number) => `users/${id}`,
    CREATE: 'users',
    UPDATE: (id: number) => `users/${id}`,
    DELETE: (id: number) => `users/${id}`,
  },
};
