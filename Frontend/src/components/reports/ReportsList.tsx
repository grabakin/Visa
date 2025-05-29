import React from 'react';
import { Row, Col, Empty, Spin } from 'antd';
import ReportCard from './ReportCard';
import type { ReportTemplateModel } from '../../types/reportModels';

interface ReportsListProps {
  templates: ReportTemplateModel[];
  loading: boolean;
  onSelectTemplate: (template: ReportTemplateModel) => void;
}

export default function ReportsList({ 
  templates, 
  loading, 
  onSelectTemplate 
}: ReportsListProps) {
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '40px 0' 
      }}>
        <Spin size="large" tip="Загрузка шаблонов..." />
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <Empty 
        description="Шаблоны отчетов не найдены" 
        style={{ margin: '40px 0' }}
      />
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      {templates.map(template => (
        <Col key={template.id} xs={24} sm={12} md={8} lg={6}>
          <ReportCard 
            template={template} 
            onSelect={onSelectTemplate} 
          />
        </Col>
      ))}
    </Row>
  );
}
