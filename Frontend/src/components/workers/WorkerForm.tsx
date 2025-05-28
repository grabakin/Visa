// Create file: Frontend/src/components/workers/WorkerForm.tsx
import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import type { WorkerModel } from "../../utils/api/workersApi";

interface WorkerFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: Omit<WorkerModel, "id" | "formattedId">) => void;
  initialValues?: Partial<WorkerModel>;
  title?: string;
}

export default function WorkerForm({
  visible,
  onCancel,
  onSave,
  initialValues = {},
  title = "Добавить работника",
}: WorkerFormProps) {
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

  return (
    <Modal
      open={visible}
      title={title}
      okText="Сохранить"
      cancelText="Отмена"
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical" initialValues={{ status: "active" }}>
        <Form.Item
          name="fullName"
          label="ФИО"
          rules={[{ required: true, message: "Пожалуйста, введите ФИО" }]}
        >
          <Input placeholder="Введите ФИО работника" />
        </Form.Item>

        <Form.Item
          name="position"
          label="Должность"
          rules={[{ required: true, message: "Пожалуйста, введите должность" }]}
        >
          <Input placeholder="Введите должность" />
        </Form.Item>

        <Form.Item name="phone" label="Телефон">
          <Input placeholder="Введите номер телефона" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: "email", message: "Пожалуйста, введите корректный email" },
          ]}
        >
          <Input placeholder="Введите email" />
        </Form.Item>

        <Form.Item name="status" label="Статус">
          <Select>
            <Select.Option value="active">Активный</Select.Option>
            <Select.Option value="vacation">В отпуске</Select.Option>
            <Select.Option value="unavailable">Недоступен</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="desctiption" label="Описание">
          <Input.TextArea
            rows={4}
            placeholder="Дополнительная информация о работнике"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
