// API base URL and endpoints
const API_URL = 'http://localhost:5166/api';
const DOCUMENTS_ENDPOINT = `${API_URL}/Document`;

export interface DocumentModel {
  id: number;
  formattedId: string;
  clientId?: number;
  orderId?: number;
  docType?: string;
  docFile?: string; // Base64 encoded file
  fileName?: string;
  createdAt: string;
  updatedAt: string;
  
  // For UI display (derived from relationships)
  clientName?: string;
  orderNumber?: string;
}

// Get all documents
export const getDocuments = async (): Promise<DocumentModel[]> => {
  const response = await fetch(DOCUMENTS_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  
  const documents = await response.json();
  
  // Add client and order display names
  return documents.map((doc: any) => ({
    ...doc,
    clientName: doc.client?.fullName || 'Не указан',
    orderNumber: doc.order?.formattedId || 'Не указан'
  }));
};

// Get document by ID
export const getDocumentById = async (id: number): Promise<DocumentModel> => {
  const response = await fetch(`${DOCUMENTS_ENDPOINT}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch document');
  }
  
  const doc = await response.json();
  return {
    ...doc,
    clientName: doc.client?.fullName || 'Не указан',
    orderNumber: doc.order?.formattedId || 'Не указан'
  };
};

// Get documents by client
export const getDocumentsByClient = async (clientId: number): Promise<DocumentModel[]> => {
  const response = await fetch(`${DOCUMENTS_ENDPOINT}/client/${clientId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch client documents');
  }
  return response.json();
};

// Get documents by order
export const getDocumentsByOrder = async (orderId: number): Promise<DocumentModel[]> => {
  const response = await fetch(`${DOCUMENTS_ENDPOINT}/order/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order documents');
  }
  return response.json();
};

// Upload a single document
export const uploadDocument = async (document: any): Promise<DocumentModel> => {
  // Handle both FormData and direct JSON upload
  if (document instanceof FormData) {
    const response = await fetch(`${DOCUMENTS_ENDPOINT}/upload`, {
      method: 'POST',
      body: document,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload document');
    }
    return response.json();
  } else {
    // JSON payload
    const response = await fetch(DOCUMENTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(document),
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload document');
    }
    return response.json();
  }
};

// Update document metadata
export const updateDocument = async (id: number, document: Partial<DocumentModel>): Promise<void> => {
  const response = await fetch(`${DOCUMENTS_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update document');
  }
};

// Delete document
export const deleteDocument = async (id: number): Promise<void> => {
  const response = await fetch(`${DOCUMENTS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
};

// Helper function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Import multiple documents
export const importDocuments = async (files: File[], metadata: {
  clientId?: number,
  orderId?: number,
  docType?: string
}): Promise<DocumentModel[]> => {
  if (files.length === 0) {
    return [];
  }
  
  // If using direct server import endpoint
  if (files.length <= 5) {
    // For a smaller number of files, use the server-side batch import
    const formData = new FormData();
    
    // Add metadata
    if (metadata.clientId) formData.append('clientId', metadata.clientId.toString());
    if (metadata.orderId) formData.append('orderId', metadata.orderId.toString());
    if (metadata.docType) formData.append('docType', metadata.docType);
    
    // Add files
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await fetch(`${DOCUMENTS_ENDPOINT}/import`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to import documents');
    }
    
    return response.json();
  } else {
    // For larger batches, process files individually to avoid timeouts
    const uploadPromises = files.map(async (file) => {
      const fileBase64 = await fileToBase64(file);
      
      // Remove the data:application/pdf;base64, part
      const base64Content = fileBase64.split(',')[1];
      
      const document = {
        clientId: metadata.clientId,
        orderId: metadata.orderId,
        docType: metadata.docType || 'Другое',
        docFile: base64Content,
        fileName: file.name,
      };
      
      const response = await fetch(DOCUMENTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload document: ${file.name}`);
      }
      
      return response.json();
    });
    
    // Wait for all uploads to complete
    return Promise.all(uploadPromises);
  }
};
