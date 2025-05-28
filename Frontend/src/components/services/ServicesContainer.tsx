import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Tabs,
  message,
  Typography,
  Tooltip,
  Space,
} from "antd";
import { MagnifyingGlass, Plus } from "phosphor-react";
import ServicesTable from "./ServicesTable";
import ServiceForm from "./ServiceForm";
import { 
  getServices, 
  createService, 
  updateService, 
  deleteService, 
  type ServiceModel, 
  type CreateServiceModel, 
  type UpdateServiceModel 
} from "../../utils/api/servicesApi";

const { Title } = Typography;

export default function ServicesContainer() {
  const [services, setServices] = useState<ServiceModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceModel> | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      setServices(data);
    } catch (error) {
      message.error("Не удалось загрузить список услуг");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: CreateServiceModel) => {
    try {
      if (editingService?.id) {
        // Update existing service
        await updateService(editingService.id, { ...values, id: editingService.id } as UpdateServiceModel);
        message.success("Услуга успешно обновлена");
      } else {
        // Create new service
        await createService(values);
        message.success("Услуга успешно создана");
      }
      setIsFormVisible(false);
      setEditingService(undefined);
      fetchServices(); // Refresh service list
    } catch (error) {
      message.error("Не удалось сохранить услугу");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteService(id);
      message.success("Услуга успешно удалена");
      fetchServices(); // Refresh service list
    } catch (error) {
      message.error("Не удалось удалить услугу");
      console.error(error);
    }
  };

  const showAddForm = () => {
    setEditingService(undefined);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingService(undefined);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Filter services by search text and active tab
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchText === "" ||
      service.country.toLowerCase().includes(searchText.toLowerCase()) ||
      service.visaType.toLowerCase().includes(searchText.toLowerCase()) ||
      service.formattedId.toLowerCase().includes(searchText.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && service.status === "active") ||
      (activeTab === "inactive" && service.status === "inactive") ||
      (activeTab === "pending" && service.status === "pending");

    return matchesSearch && matchesTab;
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={2}>Услуги</Title>
        <Tooltip title="Добавить услугу">
          <Button
            type="primary"
            icon={<Plus size={20} weight="bold" />}
            onClick={showAddForm}
          >
            Добавить
          </Button>
        </Tooltip>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Поиск по стране, типу или ID"
            prefix={<MagnifyingGlass size={18} />}
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
          <Tabs
            defaultActiveKey="all"
            onChange={setActiveTab}
            items={[
              {
                label: "Все",
                key: "all",
              },
              {
                label: "Активные",
                key: "active",
              },
              {
                label: "Неактивные", 
                key: "inactive",
              },
              {
                label: "В ожидании",
                key: "pending",
              },
            ]}
          />
        </Space>
      </div>

      <ServicesTable
        data={filteredServices}
        loading={loading}
        onEdit={(service) => {
          setEditingService(service);
          setIsFormVisible(true);
        }}
        onDelete={handleDelete}
      />

      <ServiceForm
        visible={isFormVisible}
        onCancel={handleCancel}
        onSave={handleSave}
        initialValues={editingService}
        title={editingService ? "Редактировать услугу" : "Добавить услугу"}
      />
    </div>
  );
}
