// Create file: Frontend/src/utils/api/workersApi.ts
const API_URL = 'http://localhost:5166/api';
const WORKERS_ENDPOINT = `${API_URL}/Worker`;

export interface WorkerModel {
  id: number;
  formattedId: string;
  fullName: string;
  position: string;
  phone: string;
  email: string;
  status: string;
  desctiption: string; // Note: This matches your backend typo
}

// Get all workers
export const getWorkers = async (): Promise<WorkerModel[]> => {
  const response = await fetch(WORKERS_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to fetch workers');
  }
  return response.json();
};

// Get worker by ID
export const getWorker = async (id: number): Promise<WorkerModel> => {
  const response = await fetch(`${WORKERS_ENDPOINT}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch worker');
  }
  return response.json();
};

// Create new worker
export const createWorker = async (worker: Omit<WorkerModel, 'id' | 'formattedId'>): Promise<WorkerModel> => {
  const response = await fetch(WORKERS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(worker),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create worker');
  }
  return response.json();
};

// Update worker
export const updateWorker = async (id: number, worker: Partial<WorkerModel>): Promise<WorkerModel> => {
  const response = await fetch(`${WORKERS_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({...worker, id}),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update worker');
  }
  return response.json();
};

// Delete worker
export const deleteWorker = async (id: number): Promise<void> => {
  const response = await fetch(`${WORKERS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete worker');
  }
};