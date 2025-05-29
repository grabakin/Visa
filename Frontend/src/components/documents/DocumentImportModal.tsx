import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Upload,
  Button,
  Select,
  message,
  List,
  Progress,
  Spin,
  Space,
  Typography,
  Divider,
} from "antd";
import { UploadOutlined, InboxOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { importDocuments } from "../../utils/api/documentsApi";
import { getClients } from "../../utils/api/clientsApi";
import { getOrders } from "../../utils/api/ordersApi";

const { Dragger } = Upload;
const { Option } = Select;
const { Text, Title } = Typography;

interface DocumentImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

type FileWithStatus = UploadFile<any> & {
  status: "uploading" | "done" | "error" | "removed" | "pending";
  percent?: number;
}

export default function DocumentImportModal({
  visible,
  onCancel,
  onSuccess,
}: DocumentImportModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<FileWithStatus[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [clients, setClients] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    total: number;
    completed: boolean;
  }>({
    success: 0,
    failed: 0,
    total: 0,
    completed: false,
  });

  // Load clients and orders on mount
  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
      setUploadProgress(0);
      setUploadResults({
        success: 0,
        failed: 0,
        total: 0,
        completed: false,
      });
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

  // Handle file import
  const handleImport = async () => {
    try {
      await form.validateFields();
      
      if (fileList.length === 0) {
        message.error("Пожалуйста, выберите файлы для импорта");
        return;
      }

      setUploading(true);
      setUploadResults({
        ...uploadResults,
        total: fileList.length,
        completed: false,
      });
      
      // Get files from file list
      const files = fileList.map(file => file.originFileObj as File);
      
      // Get form values
      const values = form.getFieldsValue();
      
      // Create metadata object
      const metadata = {
        clientId: values.clientId,
        orderId: values.orderId,
        docType: values.docType,
      };
      
      // Update files with pending status
      setFileList(prev =>
        prev.map(file => ({
          ...file,
          status: "uploading",
          percent: 0,
        }))
      );
      
      // Upload files in batches to avoid overwhelming the server
      const batchSize = 3;
      let successCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        try {
          // Upload batch
          await importDocuments(batch, metadata);
          
          // Update file statuses
          setFileList(prev => {
            const newList = [...prev];
            for (let j = i; j < i + batch.length && j < files.length; j++) {
              newList[j] = {
                ...newList[j],
                status: "done",
                percent: 100,
              };
            }
            return newList;
          });
          
          successCount += batch.length;
        } catch (error) {
          console.error("Batch upload failed:", error);
          
          // Update file statuses
          setFileList(prev => {
            const newList = [...prev];
            for (let j = i; j < i + batch.length && j < files.length; j++) {
              newList[j] = {
                ...newList[j],
                status: "error",
                percent: 100,
              };
            }
            return newList;
          });
          
          failedCount += batch.length;
        }
        
        // Update progress
        const progress = Math.floor(((i + batch.length) / files.length) * 100);
        setUploadProgress(progress);
      }
      
      // Update upload results
      setUploadResults({
        success: successCount,
        failed: failedCount,
        total: files.length,
        completed: true,
      });
      
      if (failedCount === 0) {
        message.success(`Успешно импортировано ${successCount} документов`);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        message.warning(`Импортировано ${successCount} из ${files.length} документов`);
      }
    } catch (error) {
      console.error("Import failed:", error);
      message.error("Не удалось импортировать документы");
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

  // Upload props for files
  const uploadProps: UploadProps = {
    multiple: true,
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
        message.error(`${file.name}: Неподдерживаемый формат файла`);
        return Upload.LIST_IGNORE;
      }
      
      // Validate file size (max 10MB)
      const isLessThan10MB = file.size / 1024 / 1024 < 10;
      if (!isLessThan10MB) {
        message.error(`${file.name}: Файл должен быть меньше 10MB`);
        return Upload.LIST_IGNORE;
      }
      
      // Add file to list with pending status
      setFileList(prev => [...prev, { ...file, status: "pending" } as unknown as FileWithStatus]);
      return false; // Prevent auto upload
    },
    fileList,
    // Limit to 20 files maximum
    maxCount: 20,
  };

  return (
    <Modal
      title="Импорт документов"
      open={visible}
      onCancel={uploading ? undefined : onCancel}
      footer={[
        <Button key="back" onClick={onCancel} disabled={uploading}>
          {uploadResults.completed ? "Закрыть" : "Отмена"}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleImport}
          disabled={fileList.length === 0 || uploading}
        >
          Импортировать
        </Button>,
      ]}
      width={700}
      maskClosable={!uploading}
      closable={!uploading}
    >
      <Spin spinning={loadingData}>
        <Form
          form={form}
          layout="vertical"
        >
          {/* Files upload area */}
          {!uploadResults.completed && (
            <Form.Item 
              name="files" 
              label="Файлы документов" 
              rules={[{ required: true, message: 'Пожалуйста, выберите файлы' }]}
            >
              <Dragger {...uploadProps} disabled={uploading}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Нажмите или перетащите файлы для загрузки
                </p>
                <p className="ant-upload-hint">
                  Поддерживаются PDF, JPEG, PNG, DOC, DOCX. Максимальный размер каждого файла: 10MB
                </p>
              </Dragger>
            </Form.Item>
          )}

          {/* Batch metadata */}
          <Divider>Общие метаданные для всех документов</Divider>

          {/* Document type */}
          <Form.Item 
            name="docType" 
            label="Тип документа"
          >
            <Select placeholder="Выберите тип документа" allowClear>
              {documentTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Client selection */}
          <Form.Item 
            name="clientId" 
            label="Клиент"
            tooltip="Выберите клиента, к которому относятся документы"
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
            tooltip="Выберите заказ, к которому относятся документы"
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

        {/* Upload progress */}
        {uploading && (
          <div style={{ marginTop: 16 }}>
            <Progress percent={uploadProgress} status="active" />
            <Text>Загрузка документов... {uploadProgress}%</Text>
          </div>
        )}

        {/* Upload results */}
        {uploadResults.completed && (
          <div style={{ marginTop: 16 }}>
            <Title level={4}>Результаты импорта</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                Всего файлов: {uploadResults.total}
              </Text>
              <Text>
                <CheckCircleFilled style={{ color: '#52c41a', marginRight: 8 }} />
                Успешно загружено: {uploadResults.success}
              </Text>
              {uploadResults.failed > 0 && (
                <Text>
                  <CloseCircleFilled style={{ color: '#f5222d', marginRight: 8 }} />
                  Не удалось загрузить: {uploadResults.failed}
                </Text>
              )}
            </Space>
          </div>
        )}

        {/* File list with status */}
        {fileList.length > 0 && (
          <List
            style={{ marginTop: 16 }}
            size="small"
            bordered
            dataSource={fileList}
            renderItem={file => (
              <List.Item
                actions={[
                  file.status === "done" ? (
                    <CheckCircleFilled style={{ color: '#52c41a' }} />
                  ) : file.status === "error" ? (
                    <CloseCircleFilled style={{ color: '#f5222d' }} />
                  ) : null,
                ]}
              >
                <List.Item.Meta
                  title={file.name}
                  description={`${(file.size! / 1024).toFixed(2)} KB`}
                />
                {file.status === "uploading" && (
                  <Progress
                    percent={file.percent}
                    size="small"
                    status="active"
                    style={{ width: 100 }}
                  />
                )}
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Modal>
  );
}
