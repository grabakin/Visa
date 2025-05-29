import React from 'react';
import { Card, Button, Typography, Spin, Result } from 'antd';
import { FileDoc, Download, ArrowLeft } from 'phosphor-react';
import type { ReportResultModel } from '../../types/reportModels';
import { downloadReport } from '../../utils/api/reportsApi';

const { Title, Text } = Typography;

interface ReportPreviewProps {
  result: ReportResultModel | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export default function ReportPreview({ 
  result, 
  loading, 
  error, 
  onBack 
}: ReportPreviewProps) {
  // Handle download button click
  const handleDownload = () => {
    if (result) {
      downloadReport(result.downloadUrl);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" tip="Заполнение документа..." />
        <Text style={{ display: 'block', marginTop: 16 }}>
          Пожалуйста, подождите. Мы формируем ваш документ...
        </Text>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Result
        status="error"
        title="Ошибка генерации документа"
        subTitle={error}
        extra={[
          <Button key="back" onClick={onBack} icon={<ArrowLeft size={16} />}>
            Назад
          </Button>
        ]}
      />
    );
  }

  // No result yet
  if (!result) {
    return null;
  }

  // Success state with preview
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FileDoc size={24} style={{ marginRight: 8 }} />
          <span>Ваш документ готов</span>
        </div>
      }
      style={{ 
        maxWidth: 600, 
        margin: '0 auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        borderRadius: 8
      }}
      actions={[
        <Button 
          key="back" 
          onClick={onBack}
          icon={<ArrowLeft size={16} />}
        >
          Назад
        </Button>,
        <Button 
          key="download" 
          type="primary" 
          onClick={handleDownload}
          icon={<Download size={16} />}
        >
          Скачать
        </Button>
      ]}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <FileDoc size={64} weight="thin" style={{ margin: '0 auto 16px', color: '#1890ff' }} />
        
        <Title level={4}>{result.fileName}</Title>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Документ создан: {new Date(result.generatedAt).toLocaleString()}
        </Text>
        
        <Text>
          Документ успешно создан и готов к скачиванию. 
          Нажмите кнопку "Скачать", чтобы получить файл.
        </Text>
      </div>
    </Card>
  );
}
