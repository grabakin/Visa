import type { OrderModel, OrderNoteModel } from '../../types/models';

const BASE_URL = 'http://localhost:5166/api';
const ORDERS_ENDPOINT = `${BASE_URL}/orders`;
const ORDER_NOTES_ENDPOINT = `${BASE_URL}/OrderNote`;

// Define DTOs that match the backend
export interface CreateOrderDto {
  clientId: number;
  workerId: number;
  serviceId: number;
  orderDate: string;
  status: string;
  cost: number;
  deadline?: string;
  description?: string;
}

export interface UpdateOrderDto {
  clientId: number;
  workerId: number;
  serviceId: number;
  orderDate: string;
  status: string;
  cost: number;
  deadline?: string;
  description?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
}

// Re-export the types for backward compatibility
export type { OrderModel, OrderNoteModel };

// Get all orders
export const getOrders = async (): Promise<OrderModel[]> => {
  try {
    const response = await fetch(ORDERS_ENDPOINT);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const orders = await response.json();
    console.log('Orders from API:', orders);
    
    // The backend now sends the names directly in the DTO
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (id: number): Promise<OrderModel> => {
  try {
    const response = await fetch(`${ORDERS_ENDPOINT}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    
    const order = await response.json();
    console.log('Order from API:', order);
    
    // The backend now sends the names directly in the DTO
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Create new order
export const createOrder = async (order: CreateOrderDto): Promise<OrderModel> => {
  try {
    // Format data properly for backend
    const formattedOrder: CreateOrderDto = {
      clientId: Number(order.clientId),
      workerId: Number(order.workerId),
      serviceId: Number(order.serviceId),
      status: order.status,
      orderDate: order.orderDate, // Ensure proper date format in form submission
      deadline: order.deadline,
      cost: Number(order.cost),
      description: order.description || ""
    };
    
    console.log('Creating order with data:', JSON.stringify(formattedOrder, null, 2));
    
    const response = await fetch(ORDERS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedOrder),
    });
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        // Try to get JSON error details if available
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        errorDetails = errorText;
      } catch (readError) {
        errorDetails = 'Could not read error details';
      }
      
      throw new Error(`Failed to create order: ${response.status} ${response.statusText}\nDetails: ${errorDetails}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (id: number, order: UpdateOrderDto): Promise<OrderModel> => {
  try {
    const response = await fetch(`${ORDERS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        errorDetails = errorText;
      } catch (readError) {
        errorDetails = 'Could not read error details';
      }
      
      throw new Error(`Failed to update order: ${response.status} ${response.statusText}\nDetails: ${errorDetails}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (id: number): Promise<void> => {
  const response = await fetch(`${ORDERS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete order');
  }
};

// Get order notes
export const getOrderNotes = async (orderId: number): Promise<OrderNoteModel[]> => {
  const response = await fetch(`${ORDERS_ENDPOINT}/${orderId}/notes`);
  if (!response.ok) {
    throw new Error('Failed to fetch order notes');
  }
  return response.json();
};

// Add note to order
export const addOrderNote = async (orderId: number, content: string, userId: number): Promise<OrderNoteModel> => {
  const response = await fetch(`${ORDERS_ENDPOINT}/${orderId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, createdByUserId: userId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add note to order');
  }
  return response.json();
};

// Update order status - simplified to avoid race conditions
export const updateOrderStatus = async (id: number, status: string): Promise<OrderModel> => {
  try {
    console.log(`Updating order ${id} status to: ${status}`);
    
    // Only send the status field - this reduces chances of conflicts
    const statusUpdate = { status: status };
    console.log('Status update payload:', JSON.stringify(statusUpdate));
    
    // Check if we're using a valid status from ORDER_STATUSES
    // This is the updated API endpoint that only updates status
    const response = await fetch(`${ORDERS_ENDPOINT}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusUpdate),
    });
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        errorDetails = errorText;
      } catch (readError) {
        errorDetails = 'Could not read error details';
      }
      
      throw new Error(`Failed to update order status: ${response.status} ${response.statusText}\nDetails: ${errorDetails}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Assign order to worker
export const assignOrderToWorker = async (id: number, workerId: number): Promise<OrderModel> => {
  const response = await fetch(`${ORDERS_ENDPOINT}/${id}/assign`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to assign order to worker');
  }
  return response.json();
};
