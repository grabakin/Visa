// Define common model types for the application

// Client model type
export type ClientModel = {
  id: number;
  formattedId: string;
  fullName: string;
  email?: string;
  phone?: string;
  passportData?: string;
  birthDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Order model type
export type OrderModel = {
  id: number;
  formattedId: string;
  clientId: number;
  workerId?: number;
  serviceId: number;
  orderDate: string;
  status: string;
  cost: number;
  deadline?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  
  // Navigation properties for display
  clientName: string;
  workerName: string;
  serviceName: string;
}

// Order note model type
export type OrderNoteModel = {
  id: number;
  orderId: number;
  content: string;
  createdByUserId: number;
  createdAt: string;
  createdByName?: string;
}
