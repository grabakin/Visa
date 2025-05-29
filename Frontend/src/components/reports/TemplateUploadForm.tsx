import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload/interface';

interface TemplateUploadFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const TemplateUploadForm: React.FC<TemplateUploadFormProps> = ({ 
  visible, 
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Reset form when modal is closed
  React.useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  // Handle file changes
  const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
    // Keep only the latest file
    const latestFile = fileList.length > 0 ? [fileList[fileList.length - 1]] : [];
    setFileList(latestFile);
  };

  // Custom file validator
  const beforeUpload = (file: RcFile) => {
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  file.type === 'application/msword';
    
    if (!isDocx) {
      message.error('Вы можете загружать только файлы Word (.doc или .docx)!');
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Файл должен быть меньше 5MB!');
    }
    
    // Return false to prevent automatic upload
    return false;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (fileList.length === 0) {
        message.error('Пожалуйста, выберите файл шаблона');
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj as RcFile);
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('templateType', values.templateType);

      const response = await fetch('http://localhost:5166/api/reports/templates/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        message.success('Шаблон успешно загружен');
        onSuccess();
        onCancel();
      } else {
        const errorText = await response.text();
        message.error(`Ошибка загрузки: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading template:', error);
      message.error('Ошибка загрузки шаблона');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Загрузка шаблона документа"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={uploading}
          onClick={handleSubmit}
        >
          Загрузить
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Название шаблона"
          rules={[{ required: true, message: 'Пожалуйста, укажите название шаблона' }]}
        >
          <Input placeholder="Например: Визовая анкета" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Пожалуйста, добавьте описание шаблона' }]}
        >
          <Input.TextArea 
            placeholder="Например: Шаблон для оформления визы во Францию" 
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="templateType"
          label="Тип шаблона"
          rules={[{ required: true, message: 'Пожалуйста, укажите тип шаблона' }]}
        >
          <Input placeholder="Например: visa_application" />
        </Form.Item>

        <Form.Item
          label="Файл шаблона (.docx)"
          required
        >
          <Upload
            beforeUpload={beforeUpload}
            fileList={fileList}
            onChange={handleFileChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Выбрать файл</Button>
          </Upload>
          <div style={{ marginTop: 8, color: '#888' }}>
            Поддерживаются форматы .doc и .docx с метками в формате ![ИмяПоля]
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateUploadForm;
