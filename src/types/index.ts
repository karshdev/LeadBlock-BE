export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  name: string;
  company: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface UpdateLeadDto {
  name?: string;
  company?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

