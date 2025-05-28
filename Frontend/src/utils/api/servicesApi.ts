// API base URL and endpoints
const API_URL = 'http://localhost:5166/api'; // Adjust to match your .NET backend URL
const SERVICES_ENDPOINT = `${API_URL}/Service`;

export interface ServiceModel {
  id: number;
  formattedId: string;
  country: string;
  visaType: string;
  standardDuration?: number;
  price?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

// For creating a new service (omits server-generated fields)
export type CreateServiceModel = Omit<ServiceModel, 'id' | 'formattedId' | 'createdAt' | 'updatedAt'>;

// For updating a service
export type UpdateServiceModel = Partial<ServiceModel> & { id: number };

// Get all services
export const getServices = async (): Promise<ServiceModel[]> => {
  const response = await fetch(SERVICES_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  return response.json();
};

// Get service by ID
export const getService = async (id: number): Promise<ServiceModel> => {
  const response = await fetch(`${SERVICES_ENDPOINT}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch service ${id}`);
  }
  return response.json();
};

// Create new service
export const createService = async (service: CreateServiceModel): Promise<ServiceModel> => {
  const response = await fetch(SERVICES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create service');
  }
  return response.json();
};

// Update service
export const updateService = async (id: number, service: UpdateServiceModel): Promise<void> => {
  const response = await fetch(`${SERVICES_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update service ${id}`);
  }
  // No need to parse response as there is no response body
};

// Delete service
export const deleteService = async (id: number): Promise<void> => {
  const response = await fetch(`${SERVICES_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete service ${id}`);
  }
};
