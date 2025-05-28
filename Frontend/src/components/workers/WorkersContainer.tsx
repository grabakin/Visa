// Create file: Frontend/src/components/workers/WorkersContainer.tsx
import React, { useState, useEffect } from "react";
import { Button, Input, message, Tabs, Typography } from "antd";
import { MagnifyingGlass, Plus } from "phosphor-react";
import {
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  type WorkerModel,
} from "../../utils/api/workersApi";
import WorkersTable from "./WorkersTable";
import WorkerForm from "./WorkerForm";

const { Title } = Typography;

export default function WorkersContainer() {
  const [workers, setWorkers] = useState<WorkerModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingWorker, setEditingWorker] = useState<
    Partial<WorkerModel> | undefined
  >(undefined);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await getWorkers();
      setWorkers(data);
    } catch (error) {
      message.error("Failed to fetch workers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (
    values: Omit<WorkerModel, "id" | "formattedId">
  ) => {
    try {
      if (editingWorker?.id) {
        // Update existing worker
        await updateWorker(editingWorker.id, {
          ...values,
          id: editingWorker.id,
        });
        message.success("Работник успешно обновлен");
      } else {
        // Create new worker
        await createWorker(values);
        message.success("Работник успешно создан");
      }
      setIsFormVisible(false);
      setEditingWorker(undefined);
      fetchWorkers(); // Refresh worker list
    } catch (error) {
      message.error("Не удалось сохранить работника");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWorker(id);
      message.success("Работник успешно удален");
      fetchWorkers(); // Refresh worker list
    } catch (error) {
      message.error("Не удалось удалить работника");
      console.error(error);
    }
  };

  const showAddForm = () => {
    setEditingWorker(undefined);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingWorker(undefined);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Filter workers based on search text
  const filteredWorkers = workers.filter((worker) => {
    const searchLower = searchText.toLowerCase();
    return (
      worker.fullName?.toLowerCase().includes(searchLower) ||
      worker.position?.toLowerCase().includes(searchLower) ||
      worker.formattedId?.toLowerCase().includes(searchLower) ||
      worker.email?.toLowerCase().includes(searchLower)
    );
  });

  // Filter workers based on active tab
  const displayedWorkers =
    activeTab === "all"
      ? filteredWorkers
      : filteredWorkers.filter((worker) => worker.status === activeTab);

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
        <Title level={2}>Работники</Title>
        <Button type="primary" icon={<Plus size={16} />} onClick={showAddForm}>
          Добавить работника
        </Button>
      </div>

      <div style={{ display: "flex", marginBottom: 16 }}>
        <Input
          placeholder="Поиск работников"
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
          { key: "all", label: "Все работники" },
          { key: "active", label: "Активные" },
          { key: "vacation", label: "В отпуске" },
        ]}
      />

      <WorkersTable
        data={displayedWorkers}
        loading={loading}
        onEdit={(worker) => {
          setEditingWorker(worker);
          setIsFormVisible(true);
        }}
        onDelete={handleDelete}
      />

      <WorkerForm
        visible={isFormVisible}
        onCancel={handleCancel}
        onSave={handleSave}
        initialValues={editingWorker}
        title={editingWorker ? "Редактировать работника" : "Добавить работника"}
      />
    </div>
  );
}
