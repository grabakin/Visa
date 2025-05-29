import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  InputNumber,
  message,
  Spin,
} from "antd";
import { createOrder, updateOrder } from "../../utils/api/ordersApi";
import type { OrderModel } from "../../types/models";
import { getClients } from "../../utils/api/clientsApi";
import { getServices } from "../../utils/api/servicesApi";
import { getWorkers } from "../../utils/api/workersApi";
import { ORDER_STATUSES } from "./constants";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

interface OrderFormProps {
  visible: boolean;
  order?: OrderModel | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function OrderForm({
  visible,
  order,
  onCancel,
  onSuccess,
}: OrderFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);

  // Load data when modal becomes visible
  useEffect(() => {
    if (visible) {
      fetchData();
      if (order) {
        // Set form values if editing an existing order
        form.setFieldsValue({
          ...order,
          orderDate: order.orderDate ? dayjs(order.orderDate) : undefined,
          deadline: order.deadline ? dayjs(order.deadline) : undefined,
        });
      } else {
        // Set default values for a new order
        form.resetFields();
        form.setFieldsValue({
          orderDate: dayjs(),
          status: ORDER_STATUSES[0].value,
          cost: 0, // Default cost to zero
          workerId: workers.length > 0 ? workers[0].id : undefined, // Select first worker if available
        });
      }
    }
  }, [visible, order, form]);

  // Fetch all required data for the form
  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsData, servicesData, workersData] = await Promise.all([
        getClients(),
        getServices(),
        getWorkers(),
      ]);

      setClients(clientsData);
      setServices(servicesData);
      setWorkers(workersData);
      
      // After data is loaded, update default workerId if creating a new order
      if (!order && workersData?.length > 0) {
        form.setFieldValue('workerId', workersData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // If workerId is not selected and we have workers, use the first one
      if (!values.workerId && workers.length > 0) {
        values.workerId = workers[0].id;
      }

      // Format dates as strings in ISO format for backend
      const orderDate = values.orderDate ? values.orderDate.toDate() : new Date();
      const deadline = values.deadline ? values.deadline.toDate() : null;

      // Create a properly formatted DTO object for the API
      const orderDto = {
        clientId: Number(values.clientId),
        serviceId: Number(values.serviceId),
        workerId: Number(values.workerId || 1),
        status: values.status || "new",
        orderDate: orderDate.toISOString(),
        deadline: deadline ? deadline.toISOString() : null,
        cost: Number(values.cost || 0),
        description: values.description || ""
      };

      console.log('Submitting order data:', orderDto);

      if (order) {
        // Update existing order
        await updateOrder(order.id, orderDto);
        message.success("Заказ успешно обновлен");
      } else {
        // Create new order
        const result = await createOrder(orderDto);
        console.log('Order created successfully:', result);
        message.success("Заказ успешно создан");
      }

      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      message.error("Ошибка при сохранении заказа");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={order ? "Редактировать заказ" : "Новый заказ"}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          {order ? "Сохранить" : "Создать"}
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: ORDER_STATUSES[0].value,
            orderDate: dayjs(),
          }}
        >
          <Form.Item
            name="clientId"
            label="Клиент"
            rules={[{ required: true, message: "Выберите клиента" }]}
          >
            <Select
              placeholder="Выберите клиента"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {clients.map((client) => (
                <Option key={client.id} value={client.id}>
                  {client.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="serviceId"
            label="Услуга"
            rules={[{ required: true, message: "Выберите услугу" }]}
          >
            <Select
              placeholder="Выберите услугу"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {services.map((service) => (
                <Option key={service.id} value={service.id}>
                  {service.country} - {service.visaType}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="workerId" label="Ответственный сотрудник">
            <Select
              placeholder="Выберите сотрудника"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {workers.map((worker) => (
                <Option key={worker.id} value={worker.id}>
                  {worker.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Статус"
            rules={[{ required: true, message: "Выберите статус" }]}
          >
            <Select placeholder="Выберите статус">
              {ORDER_STATUSES.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="orderDate"
            label="Дата заказа"
            rules={[{ required: true, message: "Укажите дату заказа" }]}
          >
            <DatePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="deadline" label="Срок исполнения">
            <DatePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="cost"
            label="Стоимость"
            rules={[{ required: true, message: "Укажите стоимость" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `₽ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              min={0}
              // Removing the parser to avoid TypeScript issues
            />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
