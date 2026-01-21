export enum InquiryStatus {
  New = 1,
  Contacted = 2,
  Rejected = 3,
  Converted = 4
}

export interface Inquiry {
  id: number;
  propertyId?: number;
  propertyTitle?: string;
  propertyLocation?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  userId?: number;
  rentalId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface InquiryCreateRequest {
  propertyId?: number;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface InquiryUpdateRequest {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
}

export interface InquiryStatusUpdateRequest {
  status: number;
}

export interface InquiryFilters {
  status?: number;
  propertyId?: number;
  userId?: number;
  page?: number;
  pageSize?: number;
}

export interface InquiryListResponse {
  data: Inquiry[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
