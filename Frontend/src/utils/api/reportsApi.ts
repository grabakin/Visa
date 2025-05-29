import type { 
  ReportTemplateModel, 
  GenerateReportRequest, 
  ReportResultModel 
} from '../../types/reportModels';

const BASE_URL = 'http://localhost:5166/api';
const REPORTS_ENDPOINT = `${BASE_URL}/reports`;

// Get all report templates
export const getReportTemplates = async (): Promise<ReportTemplateModel[]> => {
  try {
    const response = await fetch(REPORTS_ENDPOINT);
    if (!response.ok) {
      throw new Error('Failed to fetch report templates');
    }
    
    const templates = await response.json();
    console.log('Report templates from API:', templates);
    
    return templates;
  } catch (error) {
    console.error('Error fetching report templates:', error);
    throw error;
  }
};

// Get report template by ID
export const getReportTemplateById = async (id: number): Promise<ReportTemplateModel> => {
  try {
    const response = await fetch(`${REPORTS_ENDPOINT}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch report template');
    }
    
    const template = await response.json();
    return template;
  } catch (error) {
    console.error('Error fetching report template:', error);
    throw error;
  }
};

// Generate report
export const generateReport = async (requestData: GenerateReportRequest): Promise<ReportResultModel> => {
  try {
    const response = await fetch(`${REPORTS_ENDPOINT}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
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
      
      throw new Error(`Failed to generate report: ${response.status} ${response.statusText}\nDetails: ${errorDetails}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
};

// Helper function to open a report download in a new tab
export const downloadReport = (downloadUrl: string): void => {
  // Check if the URL already starts with the base URL or is a full URL
  if (downloadUrl.startsWith('http')) {
    window.open(downloadUrl, '_blank');
  } else if (downloadUrl.startsWith('/api')) {
    // URL already has /api prefix, just add base domain
    const baseWithoutApi = BASE_URL.replace('/api', '');
    window.open(`${baseWithoutApi}${downloadUrl}`, '_blank');
  } else {
    // Regular case, add full base URL
    window.open(`${BASE_URL}${downloadUrl}`, '_blank');
  }
};

// Get client fields for autofilling forms
export const getClientFields = async (clientId: number, orderId?: number): Promise<Record<string, string>> => {
  try {
    let url = `${REPORTS_ENDPOINT}/client-fields/${clientId}`;
    if (orderId) {
      url += `?orderId=${orderId}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch client fields');
    }
    
    const fields = await response.json();
    return fields;
  } catch (error) {
    console.error('Error fetching client fields:', error);
    // Return empty object instead of throwing to avoid breaking the form if this fails
    return {};
  }
};
