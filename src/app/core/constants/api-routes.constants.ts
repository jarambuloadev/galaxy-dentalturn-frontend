export const API_ROUTES = {
  AUTH: {
    LOGIN: 'api/auth/login',    
  },
  PATIENTS: {
    GET_ALL: 'users',
    GET_BY_ID: (id: number) => `users/${id}`,
    CREATE: 'users',
    UPDATE: (id: number) => `users/${id}`,
    DELETE: (id: number) => `users/${id}`,
  },
  PRODUCTS: { 
    GET_ALL: 'products',
    GET_BY_ID: (id: number) => `products/${id}`,
    CREATE: 'products',
    UPDATE: (id: number) => `products/${id}`,
    DELETE: (id: number) => `products/${id}`,  
    }
}