import React, { useState, useEffect } from "react";
import { Button, Input, message, Tabs, Typography } from "antd";
import { MagnifyingGlass, Plus } from "phosphor-react";
import ClientsTable from "./ClientsTable";
import ClientForm from "./ClientForm";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  type ClientModel,
  type CreateClientModel,
  type UpdateClientModel,
} from "../../utils/api/clientsApi";

const { Title } = Typography;

export default function ClientsContainer() {
  const [clients, setClients] = useState<ClientModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<ClientModel> | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      message.error("Failed to fetch clients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: CreateClientModel) => {
    try {
      if (editingClient?.id) {
        // Update existing client
        await updateClient(editingClient.id, { ...values, id: editingClient.id } as UpdateClientModel);
        message.success("Client updated successfully");
      } else {
        // Create new client
        await createClient(values);
        message.success("Client created successfully");
      }
      setIsFormVisible(false);
      setEditingClient(undefined);
      fetchClients(); // Refresh client list
    } catch (error) {
      message.error("Failed to save client");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteClient(id.toString());
      message.success("Client deleted successfully");
      fetchClients(); // Refresh client list
    } catch (error) {
      message.error("Failed to delete client");
      console.error(error);
    }
  };

  const showAddForm = () => {
    setEditingClient(undefined);
    setIsFormVisible(true);
  };

  const showEditForm = (client: ClientModel) => {
    setEditingClient(client);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingClient(undefined);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

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
        <Title level={2}>Клиенты</Title>
        <Button type="primary" icon={<Plus size={16} />} onClick={showAddForm}>
          Добавить клиента
        </Button>
      </div>

      <div style={{ display: "flex", marginBottom: 16 }}>
        <Input
          placeholder="Поиск клиентов"
          prefix={<MagnifyingGlass size={16} />}
          style={{ maxWidth: 300, marginRight: 16 }}
          value={searchText}
          onChange={handleSearch}
        />
      </div>

      <Tabs
        defaultActiveKey="all"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          { key: "all", label: "Все клиенты" },
          { key: "active", label: "Активные" },
          { key: "recent", label: "Недавние" },
        ]}
      />

      <ClientsTable
        data={clients}
        loading={loading}
        onEdit={(client) => {
          setEditingClient(client);
          setIsFormVisible(true);
        }}
        onDelete={handleDelete}
      />

      <ClientForm
        visible={isFormVisible}
        onCancel={handleCancel}
        onSave={handleSave}
        initialValues={editingClient}
        title={editingClient ? "Редактировать клиента" : "Добавить клиента"}
      />
    </div>
  );
}
