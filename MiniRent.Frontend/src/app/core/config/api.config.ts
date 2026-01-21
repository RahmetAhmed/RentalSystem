export const API_CONFIG = {
  baseUrl: 'http://localhost:5083/api',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      me: '/auth/me'
    },
    properties: {
      base: '/properties',
      byId: (id: number) => `/properties/${id}`,
      status: (id: number) => `/properties/${id}/status`
    },
    rentals: {
      base: '/rentals',
      byId: (id: number) => `/rentals/${id}`,
      end: (id: number) => `/rentals/${id}/end`
    },
    inquiries: {
      base: '/inquiries',
      byId: (id: number) => `/inquiries/${id}`,
      status: (id: number) => `/inquiries/${id}/status`
    },
    dashboard: {
      base: '/dashboard'
    },
    search: {
      base: '/search'
    },
    admin: {
      assignRole: '/Admin/assign-role',
      users: '/Admin/users',
      userById: (id: number) => `/Admin/users/${id}`,
      updateUserRole: (id: number) => `/Admin/users/${id}/role`,
      roles: '/Admin/roles'
    },
    images: {
      upload: '/images/upload',
      get: (imageId: string) => `/images/${imageId}`
    }
  }
};
