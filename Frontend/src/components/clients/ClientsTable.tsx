import React from "react";
import { Table, Button, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DotsThreeOutline,
  PencilSimple,
  Trash,
  Eye,
  FilePlus,
} from "phosphor-react";
import type { MenuProps } from "antd";
import { type ClientModel } from "../../utils/api/clientsApi";

interface ClientsTableProps {
  data: ClientModel[];
  loading?: boolean;
  onEdit?: (client: ClientModel) => void;
  onDelete?: (id: number) => void;
}

export default function ClientsTable({
  data,
  loading,
  onEdit,
  onDelete,
}: ClientsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  const actionMenu = (record: ClientModel): MenuProps => ({
    items: [
      {
        key: "view",
        label: "Просмотр",
        icon: <Eye size={16} />,
        onClick: () => console.log("View client", record.id),
      },
      {
        key: "edit",
        label: "Редактировать",
        icon: <PencilSimple size={16} />,
        onClick: () => onEdit && onEdit(record),
      },
      {
        key: "delete",
        label: "Удалить",
        icon: <Trash size={16} />,
        onClick: () => onDelete && onDelete(record.id),
        danger: true,
      },
      {
        type: "divider",
      },
      {
        key: "createApp",
        label: "Создать заявку",
        icon: <FilePlus size={16} />,
        onClick: () => console.log("Create application for client", record.id),
      },
    ],
  });

  const columns: ColumnsType<ClientModel> = [
    {
      title: "ID",
      dataIndex: "formattedId",
      key: "formattedId",
    },
    {
      title: "Имя",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
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
      title: "Паспорт",
      dataIndex: "passportData",
      key: "passportData",
      responsive: ["lg"], // Only show on large screens
    },
    {
      title: "Дата создания",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => formatDate(createdAt),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Dropdown menu={actionMenu(record)} trigger={["click"]}>
          <Button type="text" icon={<DotsThreeOutline size={20} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      bordered
      scroll={{ x: true }}
    />
  );
}
