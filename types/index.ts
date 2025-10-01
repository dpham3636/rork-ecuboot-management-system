export interface Part {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  price: number;
  cost: number;
  stockQuantity: number;
  originalQuantity: number;
  minStockLevel: number;
  supplier: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  addedAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  odometer: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  description: string;
  laborHours: number;
  laborRate: number;
  parts: ServicePart[];
  totalCost: number;
  status: 'completed' | 'in-progress' | 'pending';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePart {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceRecommendation {
  id: string;
  vehicleId: string;
  service: string;
  description: string;
  recommendedMileage: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
}