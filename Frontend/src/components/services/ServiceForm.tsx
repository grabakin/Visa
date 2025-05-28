import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Modal, Button } from "antd";
import type {
  ServiceModel,
  CreateServiceModel,
} from "../../utils/api/servicesApi";

interface ServiceFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: CreateServiceModel) => void;
  initialValues?: Partial<ServiceModel>;
  title?: string;
}

export default function ServiceForm({
  visible,
  onCancel,
  onSave,
  initialValues = {},
  title = "Добавить услугу",
}: ServiceFormProps) {
  const [form] = Form.useForm();

  // Reset form fields when switching between add/edit modes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onSave(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={visible}
      title={title}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Сохранить
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="country"
          label="Страна"
          rules={[{ required: true, message: "Пожалуйста, укажите страну" }]}
        >
          <Input placeholder="Франция" />
        </Form.Item>

        <Form.Item
          name="visaType"
          label="Тип визы"
          rules={[{ required: true, message: "Пожалуйста, укажите тип визы" }]}
        >
          <Input placeholder="Туристическая" />
        </Form.Item>

        <Form.Item
          name="standardDuration"
          label="Стандартный срок (дней)"
        >
          <InputNumber min={1} placeholder="90" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="price"
          label="Стоимость (₽)"
        >
          <InputNumber 
            min={0} 
            step={1000}
            placeholder="15000" 
            style={{ width: "100%" }}
            formatter={(value) => 
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''
            }
            parser={(value) => value ? Number(value.replace(/\s/g, '')) : 0}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Статус"
        >
          <Select placeholder="Выберите статус">
            <Select.Option value="active">Активная</Select.Option>
            <Select.Option value="inactive">Неактивная</Select.Option>
            <Select.Option value="pending">Ожидание</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
