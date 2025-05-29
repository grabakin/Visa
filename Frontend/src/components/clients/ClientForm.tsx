import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Modal, Button, Tabs, Radio, Select, Row, Col, Divider } from "antd";
import type {
  ClientModel,
  CreateClientModel,
} from "../../utils/api/clientsApi";
// Import dayjs and configure it properly
import dayjs from "dayjs";
import "dayjs/locale/ru"; // Add Russian locale

dayjs.locale("ru"); // Set locale to Russian

const { TabPane } = Tabs;
const { Option } = Select;

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

        // Handle date conversions for DatePicker components
        if (initialValues.birthDate) {
          formValues.birthDate = dayjs(initialValues.birthDate);
        }
        
        if (initialValues.identityDocIssueDate) {
          formValues.identityDocIssueDate = dayjs(initialValues.identityDocIssueDate);
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
          // Convert identity document issue date if it exists
          identityDocIssueDate:
            values.identityDocIssueDate && values.identityDocIssueDate.isValid
              ? values.identityDocIssueDate.toISOString()
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
        <Tabs defaultActiveKey="basic">
          <TabPane tab="Основная информация" key="basic">
            <Form.Item
              name="fullName"
              label="ФИО"
              rules={[
                { required: true, message: "Пожалуйста, введите ФИО клиента" },
              ]}
            >
              <Input placeholder="Иван Иванов" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone" label="Телефон">
                  <Input placeholder="+7 (999) 123-45-67" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ type: "email", message: "Email имеет неверный формат" }]}
                >
                  <Input placeholder="example@mail.com" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="birthDate" label="Дата рождения">
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: "100%" }}
                    placeholder="Выберите дату рождения"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="placeOfBirth" label="Место рождения">
                  <Input placeholder="Город, область, страна" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="gender" label="Пол">
                  <Radio.Group>
                    <Radio value="Мужской">Мужской</Radio>
                    <Radio value="Женский">Женский</Radio>
                    <Radio value="Не указан">Не указан</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="citizenship" label="Гражданство">
                  <Input placeholder="Россия" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Описание">
              <Input.TextArea
                rows={3}
                placeholder="Дополнительная информация о клиенте"
              />
            </Form.Item>
          </TabPane>

          <TabPane tab="Документы" key="documents">
            {/* Legacy field for backward compatibility */}
            <Form.Item name="passportData" label="Паспортные данные (устаревшее поле)">
              <Input.TextArea 
                rows={2} 
                placeholder="Серия и номер паспорта, кем и когда выдан" 
                disabled
              />
            </Form.Item>

            <Divider orientation="left">Документ, удостоверяющий личность</Divider>
            
            <Form.Item name="identityDocType" label="Тип документа">
              <Select placeholder="Выберите тип документа">
                <Option value="Паспорт">Паспорт</Option>
                <Option value="Загранпаспорт">Загранпаспорт</Option>
                <Option value="Свидетельство о рождении">Свидетельство о рождении</Option>
                <Option value="Вид на жительство">Вид на жительство</Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="identityDocSeries" label="Серия документа">
                  <Input placeholder="Серия" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="identityDocNumber" label="Номер документа">
                  <Input placeholder="Номер" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="identityDocIssuedByAuthority" label="Кем выдан документ">
              <Input placeholder="Наименование органа, выдавшего документ" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="identityDocIssueDate" label="Дата выдачи">
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: "100%" }}
                    placeholder="Выберите дату выдачи"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="identityDocAuthorityCode" label="Код подразделения">
                  <Input placeholder="Код подразделения" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="residentialAddress" label="Адрес проживания">
              <Input.TextArea
                rows={2}
                placeholder="Полный адрес проживания"
              />
            </Form.Item>
          </TabPane>

          <TabPane tab="Дополнительная информация" key="additional">
            <Form.Item name="maritalStatus" label="Семейное положение">
              <Select placeholder="Выберите семейное положение">
                <Option value="Не указано">Не указано</Option>
                <Option value="Холост/Не замужем">Холост/Не замужем</Option>
                <Option value="Женат/Замужем">Женат/Замужем</Option>
                <Option value="Разведен(а)">Разведен(а)</Option>
                <Option value="Вдовец/Вдова">Вдовец/Вдова</Option>
              </Select>
            </Form.Item>

            <Form.Item name="childrenInfo" label="Информация о детях">
              <Input.TextArea
                rows={2}
                placeholder="Информация о детях (количество, возраст и т.д.)"
              />
            </Form.Item>

            <Form.Item name="educationLevel" label="Уровень образования">
              <Select placeholder="Выберите уровень образования">
                <Option value="Не указано">Не указано</Option>
                <Option value="Среднее">Среднее</Option>
                <Option value="Среднее специальное">Среднее специальное</Option>
                <Option value="Неоконченное высшее">Неоконченное высшее</Option>
                <Option value="Высшее">Высшее</Option>
                <Option value="Ученая степень">Ученая степень</Option>
              </Select>
            </Form.Item>

            <Form.Item name="employmentInfo" label="Информация о трудоустройстве">
              <Input.TextArea
                rows={2}
                placeholder="Место работы, должность, стаж и т.д."
              />
            </Form.Item>

            <Form.Item name="incomeDetails" label="Информация о доходах">
              <Input.TextArea
                rows={2}
                placeholder="Общая информация о доходах"
              />
            </Form.Item>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
}
