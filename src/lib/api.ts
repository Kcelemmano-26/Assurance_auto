import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'client' | 'insurer' | 'admin';
}

export interface InsuranceRequest {
  id: number;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_registration: string;
  previous_insurer?: string;
  net_amount: number;
  commission_amount: number;
  total_amount: number;
  status: 'pending' | 'assigned' | 'processing' | 'completed' | 'rejected';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
  insurer_name?: string;
  certificate_url?: string;
  documents?: string;
  notes?: string;
}

export interface RequestDetail extends InsuranceRequest {
  client_name?: string;
  client_email?: string;
  client_phone?: string;
}

// API Auth
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: 'client' | 'insurer';
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// API Client
export const clientAPI = {
  createRequest: async (formData: FormData) => {
    const response = await api.post('/client/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getRequests: async (): Promise<InsuranceRequest[]> => {
    const response = await api.get('/client/requests');
    return response.data;
  },

  getRequest: async (id: number): Promise<RequestDetail> => {
    const response = await api.get(`/client/requests/${id}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/client/dashboard');
    return response.data;
  },
};

// API Insurer
export const insurerAPI = {
  getRequests: async (): Promise<RequestDetail[]> => {
    const response = await api.get('/insurer/requests');
    return response.data;
  },

  updateRequestStatus: async (id: number, status: string, notes?: string) => {
    const response = await api.put(`/insurer/requests/${id}/status`, { status, notes });
    return response.data;
  },

  uploadCertificate: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('certificate', file);
    const response = await api.post(`/insurer/requests/${id}/certificate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/insurer/dashboard');
    return response.data;
  },
};

// API Admin
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getClients: async () => {
    const response = await api.get('/admin/clients');
    return response.data;
  },

  getInsurers: async () => {
    const response = await api.get('/admin/insurers');
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get('/admin/requests');
    return response.data;
  },

  assignRequest: async (requestId: number, insurerId: number) => {
    const response = await api.put(`/admin/requests/${requestId}/assign`, { insurer_id: insurerId });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings: Record<string, string>) => {
    const response = await api.put('/admin/settings', { settings });
    return response.data;
  },
};

// API Payment
export const paymentAPI = {
  initiatePayment: async (requestId: number) => {
    const response = await api.post('/payment/initiate', { request_id: requestId });
    return response.data;
  },

  getPaymentStatus: async (paymentId: number) => {
    const response = await api.get(`/payment/status/${paymentId}`);
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await api.get('/payment/history');
    return response.data;
  },
};

export default api;