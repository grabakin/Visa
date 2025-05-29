import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { FilePdf, FileDoc } from 'phosphor-react';
import type { ReportTemplateModel } from '../../types/reportModels';
import { REPORT_TYPES } from './constants';

const { Title, Text } = Typography;

interface ReportCardProps {
  template: ReportTemplateModel;
  onSelect: (template: ReportTemplateModel) => void;
}

export default function ReportCard({ template, onSelect }: ReportCardProps) {
  // Find the matching report type for color and label
  const reportType = REPORT_TYPES.find(type => type.value === template.templateType) || REPORT_TYPES[0];
  
  // Select icon based on template type
  const IconComponent = template.templateType === 'visa_application' ? FileDoc : FilePdf;
  
  return (
    <Card 
      className="report-card"
      hoverable
      style={{ 
        width: 240, 
        marginBottom: 16,
        borderRadius: '8px',
        overflow: 'hidden'
      }}
      cover={
        template.thumbnailUrl ? (
          <img 
            alt={template.name}
            src={template.thumbnailUrl} 
            style={{ height: 120, objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            height: 120, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <IconComponent size={64} weight="thin" color="#bfbfbf" />
          </div>
        )
      }
      onClick={() => onSelect(template)}
    >
      <Tag color={reportType.color} style={{ marginBottom: 8 }}>
        {reportType.label}
      </Tag>
      
      <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
        {template.name}
      </Title>
      
      <Text type="secondary" style={{ display: 'block', height: 40, overflow: 'hidden' }}>
        {template.description}
      </Text>
    </Card>
  );
}
