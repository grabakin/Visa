import React, { useState, useEffect } from 'react';
import { Form, Select, Input, DatePicker, Button, Typography, Divider, InputNumber } from 'antd';
import type { ReportTemplateModel } from '../../types/reportModels';
import type { OrderModel } from '../../types/models';
import { getClients, type ClientModel } from '../../utils/api/clientsApi';
import { REQUIRED_FIELDS } from './constants';
import { getOrders } from '../../utils/api/ordersApi';
import { getClientFields } from '../../utils/api/reportsApi';

const { Title, Text } = Typography;
const { Option } = Select;

interface ReportFormProps {
  template: ReportTemplateModel;
  onSubmit: (formData: {
    templateId: number;
    clientId?: number;
    orderId?: number;
    additionalFields: Record<string, string>;
  }) => void;
  loading: boolean;
}

export default function ReportForm({ 
  template, 
  onSubmit, 
  loading 
}: ReportFormProps) {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<ClientModel[]>([]);
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>();
  const [clientOrders, setClientOrders] = useState<OrderModel[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [additionalFields, setAdditionalFields] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchPlaceholders = async () => {
      try {
        const response = await fetch(`http://localhost:5166/api/reports/placeholders/${template.id}`);
        if (response.ok) {
          const data: string[] = await response.json();
          setPlaceholders(data);
          
          // Initialize additionalFields with empty values for each placeholder
          const initialFields: {[key: string]: string} = {};
          data.forEach((placeholder: string) => {
            initialFields[placeholder] = '';
          });
          setAdditionalFields(initialFields);
        }
      } catch (error) {
        console.error('Error fetching placeholders:', error);
      }
    };

    fetchPlaceholders();
  }, [template.id]);

  // Convert string placeholders to field objects
  const placeholderFields = placeholders.map(placeholder => ({
    name: placeholder,
    label: placeholder.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    type: 'text'
  }));

  // Required fields based on template type
  const requiredFields = placeholders.length > 0 
    ? placeholderFields 
    : (REQUIRED_FIELDS[template.templateType as keyof typeof REQUIRED_FIELDS] || []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [clientsData, ordersData] = await Promise.all([
          getClients(),
          getOrders()
        ]);
        setClients(clientsData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Filter orders when client is selected
  useEffect(() => {
    if (selectedClientId) {
      const filteredOrders = orders.filter(
        order => order.clientId === selectedClientId
      );
      setClientOrders(filteredOrders);
    } else {
      setClientOrders([]);
    }
  }, [selectedClientId, orders]);

  const handleClientChange = async (value: number) => {
    setSelectedClientId(value);
    form.setFieldValue('orderId', undefined);
    
    try {
      // Use the API to get standardized field values for this client
      const clientFields = await getClientFields(value);
      
      // Check which fields from the API match our form fields
      const fieldUpdates: Record<string, string> = {};
      
      // Find which fields exist in our form and set values for them
      requiredFields.forEach(field => {
        const fieldName = field.name;
        if (fieldName in clientFields) {
          fieldUpdates[fieldName] = clientFields[fieldName];
        }
      });
      
      // Update the form with all client data at once
      if (Object.keys(fieldUpdates).length > 0) {
        form.setFieldsValue(fieldUpdates);
      }
    } catch (error) {
      console.error('Error auto-filling client fields:', error);
    }
  };

  const handleOrderChange = async (value: number) => {
    if (selectedClientId && value) {
      try {
        // Get field values specific to this client+order combination
        const orderFields = await getClientFields(selectedClientId, value);
        
        // Update form fields with order-specific values
        const fieldUpdates: Record<string, string> = {};
        
        requiredFields.forEach(field => {
          const fieldName = field.name;
          if (fieldName in orderFields) {
            fieldUpdates[fieldName] = orderFields[fieldName];
          }
        });
        
        // Update the form with all client+order data
        if (Object.keys(fieldUpdates).length > 0) {
          form.setFieldsValue(fieldUpdates);
        }
      } catch (error) {
        console.error('Error auto-filling order fields:', error);
      }
    }
  };

  const handleFinish = (values: any) => {
    const formData = {
      templateId: template.id,
      clientId: values.clientId,
      orderId: values.orderId,
      additionalFields: {} as Record<string, string>
    };

    // Add additional fields
    requiredFields.forEach(field => {
      if (values[field.name]) {
        formData.additionalFields[field.name] = String(values[field.name]);
      }
    });

    onSubmit(formData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      <Title level={4}>Создание отчета: {template.name}</Title>
      <Text type="secondary">Заполните необходимые поля для создания отчета</Text>
      
      <Divider style={{ margin: '16px 0' }} />
      
      <Form.Item
        name="clientId"
        label="Клиент"
        rules={[{ required: true, message: 'Выберите клиента' }]}
      >
        <Select 
          placeholder="Выберите клиента" 
          onChange={handleClientChange}
          loading={loadingData}
          showSearch
          optionFilterProp="children"
        >
          {clients.map(client => (
            <Option key={client.id} value={client.id}>
              {client.fullName}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="orderId"
        label="Заказ"
      >
        <Select 
          placeholder="Выберите заказ (необязательно)" 
          disabled={!selectedClientId || clientOrders.length === 0}
          loading={loadingData}
          onChange={handleOrderChange}
        >
          {clientOrders.map(order => (
            <Option key={order.id} value={order.id}>
              {order.formattedId} - {order.serviceName}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      {requiredFields.length > 0 && (
        <>
          <Divider orientation="left">Дополнительные поля</Divider>
          
          {requiredFields.map(field => {
            // Render different field types
            switch (field.type) {
              case 'date':
                return (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    rules={[{ required: true, message: `Заполните поле ${field.label}` }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                );
              case 'number':
                return (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    rules={[{ required: true, message: `Заполните поле ${field.label}` }]}
                  >
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                );
              case 'text':
              default:
                return (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    rules={[{ required: true, message: `Заполните поле ${field.label}` }]}
                  >
                    <Input />
                  </Form.Item>
                );
            }
          })}
        </>
      )}
      
      <Form.Item style={{ marginTop: 24 }}>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          block
        >
          Создать отчет
        </Button>
      </Form.Item>
    </Form>
  );
}
