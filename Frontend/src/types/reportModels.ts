// Define report model types for the application

// Report template model
export type ReportTemplateModel = {
  id: number;
  name: string;
  description: string;
  templateType: string;
  thumbnailUrl?: string;
  createdAt: string;
}

// Report generation request
export type GenerateReportRequest = {
  templateId: number;
  clientId?: number;
  orderId?: number;
  additionalFields: Record<string, string>;
}

// Report generation result
export type ReportResultModel = {
  reportId: string;
  fileName: string;
  downloadUrl: string;
  generatedAt: string;
}
