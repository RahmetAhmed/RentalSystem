export enum PropertyStatus {
  Available = 1,
  Rented = 2,
  Reserved = 3,
  Maintenance = 4
}

export interface Property {
  id: number;
  title: string;
  location: string;
  bedrooms: number;
  areaSqm: number;
  floor: number;
  price: number;
  imageId?: string;
  imageUrl?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyCreateRequest {
  title: string;
  location: string;
  bedrooms: number;
  areaSqm: number;
  floor: number;
  price: number;
  imageId?: string;
}

export interface ChangePropertyStatusRequest {
  status: PropertyStatus;
}
