export interface Rental {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyLocation: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail?: string;
  inquiryId?: number;
  startDate: string;
  endDate?: string;
  deposit: number;
  monthlyRent: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RentalCreateRequest {
  propertyId: number;
  inquiryId?: number;
  tenantName: string;
  tenantPhone: string;
  tenantEmail?: string;
  startDate: string;
  deposit: number;
  monthlyRent: number;
  notes?: string;
}

export interface RentalUpdateRequest {
  tenantName?: string;
  tenantPhone?: string;
  deposit?: number;
  monthlyRent?: number;
  notes?: string;
}

export interface RentalEndRequest {
  endDate: string;
}

export interface RentalFilters {
  isActive?: boolean;
  propertyId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
}
