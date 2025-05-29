import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Divider, Steps, message, Alert } from 'antd';
import { Plus, FileDoc, CheckCircle } from 'phosphor-react';
import TemplateUploadForm from './TemplateUploadForm';
import ReportsList from './ReportsList';
import ReportForm from './ReportForm';
import ReportPreview from './ReportPreview';
import type { ReportTemplateModel, GenerateReportRequest, ReportResultModel } from '../../types/reportModels';
import { getReportTemplates, generateReport } from '../../utils/api/reportsApi';

const { Title, Text } = Typography;

// Step identifiers
enum ReportStep {
  SELECT_TEMPLATE = 0,
  FILL_FORM = 1,
  PREVIEW = 2,
}

export default function ReportsContainer() {
  // State
  const [templates, setTemplates] = useState<ReportTemplateModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ReportStep>(ReportStep.SELECT_TEMPLATE);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplateModel | null>(null);
  const [reportResult, setReportResult] = useState<ReportResultModel | null>(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  // Function to fetch templates
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReportTemplates();
      setTemplates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки шаблонов';
      setError(errorMessage);
      message.error('Не удалось загрузить шаблоны отчетов');
    } finally {
      setLoading(false);
    }
  };

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle template selection
  const handleSelectTemplate = (template: ReportTemplateModel) => {
    setSelectedTemplate(template);
    setCurrentStep(ReportStep.FILL_FORM);
  };

  // Handle form submission
  const handleFormSubmit = async (formData: GenerateReportRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateReport(formData);
      setReportResult(result);
      setCurrentStep(ReportStep.PREVIEW);
      message.success('Отчет успешно сгенерирован');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка генерации отчета';
      setError(errorMessage);
      message.error('Не удалось сгенерировать отчет');
    } finally {
      setLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep === ReportStep.FILL_FORM) {
      setCurrentStep(ReportStep.SELECT_TEMPLATE);
      setSelectedTemplate(null);
    } else if (currentStep === ReportStep.PREVIEW) {
      setCurrentStep(ReportStep.FILL_FORM);
      setReportResult(null);
    }
  };

  // Handle reset
  const handleReset = () => {
    setCurrentStep(ReportStep.SELECT_TEMPLATE);
    setSelectedTemplate(null);
    setReportResult(null);
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case ReportStep.SELECT_TEMPLATE:
        return (
          <ReportsList
            templates={templates}
            loading={loading}
            onSelectTemplate={handleSelectTemplate}
          />
        );
      
      case ReportStep.FILL_FORM:
        if (!selectedTemplate) return null;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Button 
              onClick={handleBack} 
              style={{ alignSelf: 'flex-start' }}
              icon={<span style={{ marginRight: 8 }}>←</span>}
            >
              Назад к шаблонам
            </Button>
            
            <ReportForm
              template={selectedTemplate}
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </div>
        );
      
      case ReportStep.PREVIEW:
        return (
          <ReportPreview
            result={reportResult}
            loading={loading}
            error={error}
            onBack={handleBack}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card
      className="reports-container"
      bordered={false}
      style={{
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        borderRadius: '8px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, fontSize: '24px' }}>
            Автозаполнение
          </Title>
          <Text type="secondary">
            Автоматическое заполнение документов для ваших клиентов
          </Text>
        </div>
        
        {currentStep === ReportStep.SELECT_TEMPLATE && (
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsUploadModalVisible(true)}
          >
            Загрузить шаблон
          </Button>
        )}
      </div>

      <Divider style={{ margin: '12px 0 24px' }} />

      {/* Steps */}
      <Steps
        current={currentStep}
        items={[
          {
            title: 'Выбор шаблона',
            icon: <FileDoc size={20} />,
          },
          {
            title: 'Заполнение данных',
            icon: <span>📝</span>,
          },
          {
            title: 'Готовый документ',
            icon: <CheckCircle size={20} />,
          },
        ]}
        style={{ marginBottom: 32 }}
      />

      {/* Error message */}
      {error && currentStep !== ReportStep.PREVIEW && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* Step content */}
      {renderStepContent()}

      {/* Template upload modal */}
      <TemplateUploadForm
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onSuccess={() => {
          fetchTemplates();
          message.success('Шаблон успешно загружен');
        }}
      />
    </Card>
  );
}
