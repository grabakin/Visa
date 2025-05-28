// API base URL and endpoints
const API_URL = 'http://localhost:5166/api'; // Adjust to match your .NET backend URL
const CLIENTS_ENDPOINT = `${API_URL}/Client`;
import {Dayjs} from 'dayjs'

export interface ClientModel {
    id: number;
    formattedId: string;
    fullName: string;
    phone?: string;
    email?: string;
    passportData?: string;
    birthDate?: Dayjs;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // For creating a new client (omits server-generated fields)
  export type CreateClientModel = Omit<ClientModel, 'id' | 'formattedId' | 'createdAt' | 'updatedAt'>;
  
  // For updating a client
  export type UpdateClientModel = Partial<Omit<ClientModel, 'id'>> & { id: number };
  
// Get all clients
export const getClients = async (): Promise<ClientModel[]> => {
    const response = await fetch(CLIENTS_ENDPOINT);
    if (!response.ok) {
      throw new Error('Failed to fetch clients');
    }
    return response.json();
  };
  
  // Create new client
  export const createClient = async (client: CreateClientModel): Promise<ClientModel> => {
    const response = await fetch(CLIENTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create client');
    }
    return response.json();
  };
  
  // Update client
  export const updateClient = async (id: number, client: UpdateClientModel): Promise<ClientModel> => {
    const response = await fetch(`${CLIENTS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update client ${id}`);
    }
    return response.json();
  };
// Delete client
export const deleteClient = async (id: string): Promise<void> => {
  const response = await fetch(`${CLIENTS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete client ${id}`);
  }
};