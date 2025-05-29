import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Upload,
  Button,
  Input,
  Select,
  message,
  Space,
  Spin,
} from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { uploadDocument, fileToBase64 } from "../../utils/api/documentsApi";
import { getClients } from "../../utils/api/clientsApi";
import { getOrders } from "../../utils/api/ordersApi";

const { Dragger } = Upload;
const { Option } = Select;

interface DocumentUploadFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  clientId?: number;
  orderId?: number;
}

export default function DocumentUploadForm({
  visible,
  onCancel,
  onSuccess,
  clientId,
  orderId,
}: DocumentUploadFormProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load clients and orders on mount
  useEffect(() => {
    if (visible) {
      fetchData();
      
      // Initialize form with provided values
      if (clientId || orderId) {
        form.setFieldsValue({
          clientId,
          orderId,
        });
      }
    }
  }, [visible, clientId, orderId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  // Fetch clients and orders data
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [clientsData, ordersData] = await Promise.all([
        getClients(),
        getOrders(),
      ]);
      
      setClients(clientsData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Handle document upload
  const handleUpload = async () => {
    try {
      await form.validateFields();
      
      if (fileList.length === 0) {
        message.error("Пожалуйста, выберите файл для загрузки");
        return;
      }

      setUploading(true);
      
      const file = fileList[0]?.originFileObj as File;
      if (!file) {
        message.error("Файл не найден");
        return;
      }
      
      // Convert file to base64
      const base64File = await fileToBase64(file);
      const base64Content = base64File.split(',')[1];
      
      // Get form values
      const values = form.getFieldsValue();
      
      // Create document object
      const document = {
        clientId: values.clientId || null,
        orderId: values.orderId || null,
        docType: values.docType || 'Другое',
        docFile: base64Content,
        fileName: file.name,
      };
      
      // Upload document
      await uploadDocument(document);
      
      message.success("Документ успешно загружен");
      onSuccess();
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Не удалось загрузить документ");
    } finally {
      setUploading(false);
    }
  };

  // Document type options
  const documentTypes = [
    { label: "Паспорт", value: "Паспорт" },
    { label: "Виза", value: "Виза" },
    { label: "Анкета", value: "Анкета" },
    { label: "Квитанция", value: "Квитанция" },
    { label: "Страховка", value: "Страховка" },
    { label: "Бронь отеля", value: "Бронь отеля" },
    { label: "Авиабилет", value: "Авиабилет" },
    { label: "Другое", value: "Другое" },
  ];

  // Upload props for file
  const uploadProps: UploadProps = {
    onRemove: file => {
      setFileList(prev => prev.filter(item => item.uid !== file.uid));
    },
    beforeUpload: file => {
      // Validate file type
      const isValidType = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(file.type);
      
      if (!isValidType) {
        message.error('Неподдерживаемый формат файла. Поддерживаются PDF, JPEG, PNG, DOC, DOCX');
        return Upload.LIST_IGNORE;
      }
      
      // Validate file size (max 10MB)
      const isLessThan10MB = file.size / 1024 / 1024 < 10;
      if (!isLessThan10MB) {
        message.error('Файл должен быть меньше 10MB');
        return Upload.LIST_IGNORE;
      }
      
      // Add file to list
      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Modal
      title="Загрузка документа"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
        >
          Загрузить
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={loadingData}>
        <Form
          form={form}
          layout="vertical"
        >
          {/* File upload area */}
          <Form.Item 
            name="file" 
            label="Файл документа" 
            rules={[{ required: true, message: 'Пожалуйста, выберите файл' }]}
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Нажмите или перетащите файл для загрузки
              </p>
              <p className="ant-upload-hint">
                Поддерживаются PDF, JPEG, PNG, DOC, DOCX. Максимальный размер: 10MB
              </p>
            </Dragger>
          </Form.Item>

          {/* Document type */}
          <Form.Item 
            name="docType" 
            label="Тип документа"
            rules={[{ required: true, message: 'Пожалуйста, выберите тип документа' }]}
          >
            <Select placeholder="Выберите тип документа">
              {documentTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Client selection */}
          <Form.Item 
            name="clientId" 
            label="Клиент"
            tooltip="Выберите клиента, к которому относится документ"
          >
            <Select 
              placeholder="Выберите клиента" 
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {clients.map(client => (
                <Option key={client.id} value={client.id}>{client.fullName}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Order selection */}
          <Form.Item 
            name="orderId" 
            label="Заказ"
            tooltip="Выберите заказ, к которому относится документ"
          >
            <Select 
              placeholder="Выберите заказ" 
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {orders.map(order => (
                <Option key={order.id} value={order.id}>{order.formattedId}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
