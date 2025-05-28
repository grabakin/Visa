import React, { useEffect } from "react";
import { Form, Input, DatePicker, Modal, Button } from "antd";
import type {
  ClientModel,
  CreateClientModel,
} from "../../utils/api/clientsApi";
// Import dayjs and configure it properly
import dayjs from "dayjs";
import "dayjs/locale/ru"; // Add Russian locale

dayjs.locale("ru"); // Set locale to Russian

interface ClientFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: CreateClientModel) => void;
  initialValues?: Partial<ClientModel>;
  title?: string;
}

export default function ClientForm({
  visible,
  onCancel,
  onSave,
  initialValues = {},
  title = "Добавить клиента",
}: ClientFormProps) {
  const [form] = Form.useForm();

  // Reset form fields when switching between add/edit modes
  useEffect(() => {
    if (visible) {
      form.resetFields();

      if (initialValues) {
        // Convert dates to dayjs for DatePicker if needed
        const formValues = { ...initialValues };

        if (initialValues.birthDate) {
          formValues.birthDate = dayjs(initialValues.birthDate);
        }

        form.setFieldsValue(formValues);
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // Convert any date objects to strings for the API
        const formattedValues = {
          ...values,
          // Safely convert dayjs object to ISO string if it exists
          birthDate:
            values.birthDate && values.birthDate.isValid
              ? values.birthDate.toISOString()
              : undefined,
        };
        onSave(formattedValues);
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
          name="fullName"
          label="ФИО"
          rules={[
            { required: true, message: "Пожалуйста, введите ФИО клиента" },
          ]}
        >
          <Input placeholder="Иван Иванов" />
        </Form.Item>

        <Form.Item name="phone" label="Телефон">
          <Input placeholder="+7 (999) 123-45-67" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: "email", message: "Email имеет неверный формат" }]}
        >
          <Input placeholder="example@mail.com" />
        </Form.Item>

        <Form.Item name="passportData" label="Паспортные данные">
          <Input placeholder="Серия и номер паспорта" />
        </Form.Item>

        <Form.Item name="birthDate" label="Дата рождения">
          <DatePicker
            format="DD.MM.YYYY"
            style={{ width: "100%" }}
            placeholder="Выберите дату рождения"
          />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea
            rows={4}
            placeholder="Дополнительная информация о клиенте"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
