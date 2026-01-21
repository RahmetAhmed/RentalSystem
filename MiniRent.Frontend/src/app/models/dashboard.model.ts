export interface Dashboard {
  totalProperties: number;
  propertiesByStatus: { [key: string]: number };
  newInquiriesThisMonth: number;
  totalMonthlyRent: number;
  activeRentals: number;
}
