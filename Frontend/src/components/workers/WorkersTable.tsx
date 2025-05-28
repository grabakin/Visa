// Create file: Frontend/src/components/workers/WorkersTable.tsx
import React from "react";
import { Table, Button, Popconfirm, Tag, Space } from "antd";
import { PencilSimple, Trash, User } from "phosphor-react";
import type { WorkerModel } from "../../utils/api/workersApi";

interface WorkersTableProps {
  data: WorkerModel[];
  loading: boolean;
  onEdit: (worker: WorkerModel) => void;
  onDelete: (id: number) => void;
}

export default function WorkersTable({
  data,
  loading,
  onEdit,
  onDelete,
}: WorkersTableProps) {
  const columns = [
    {
      title: "ID",
      dataIndex: "formattedId",
      key: "formattedId",
      width: 120,
    },
    {
      title: "Имя",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Должность",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Телефон",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "green";
        let label = "Активный";

        if (status === "vacation") {
          color = "orange";
          label = "В отпуске";
        } else if (status === "unavailable") {
          color = "red";
          label = "Недоступен";
        }

        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: WorkerModel) => (
        <Space>
          <Button
            type="text"
            icon={<PencilSimple size={20} />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Вы уверены, что хотите удалить этого работника?"
            onConfirm={() => onDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="text" danger icon={<Trash size={20} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data.map((worker) => ({ ...worker, key: worker.id }))}
      loading={loading}
      pagination={{ pageSize: 10 }}
      rowKey="id"
    />
  );
}
