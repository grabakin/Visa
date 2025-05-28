import React from "react";
import { Table, Button, Dropdown, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DotsThreeOutline,
  PencilSimple,
  Trash,
  FilePlus,
} from "phosphor-react";
import type { MenuProps } from "antd";
import { type ServiceModel } from "../../utils/api/servicesApi";

interface ServicesTableProps {
  data: ServiceModel[];
  loading?: boolean;
  onEdit?: (service: ServiceModel) => void;
  onDelete?: (id: number) => void;
}

export default function ServicesTable({
  data,
  loading,
  onEdit,
  onDelete,
}: ServicesTableProps) {
  // Format currency
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "—";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price);
  };

  // Format duration in days
  const formatDuration = (days?: number) => {
    if (days === undefined || days === null) return "—";
    return `${days} ${getDaysWordForm(days)}`;
  };

  // Russian days word form
  const getDaysWordForm = (days: number) => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "дней";
    }

    if (lastDigit === 1) {
      return "день";
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return "дня";
    }

    return "дней";
  };

  // Format status with color
  const getStatusTag = (status?: string) => {
    if (!status) return null;

    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: "green", text: "Активная" },
      inactive: { color: "gray", text: "Неактивная" },
      pending: { color: "orange", text: "Ожидание" },
    };

    const statusInfo = statusMap[status.toLowerCase()] || {
      color: "blue",
      text: status,
    };

    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Action menu for each row
  const actionMenu = (record: ServiceModel): MenuProps => ({
    items: [
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
        key: "view-history",
        label: "История цен",
        icon: <FilePlus size={16} />,
        // TODO: Implement price history viewer
      },
    ],
  });

  const columns: ColumnsType<ServiceModel> = [
    {
      title: "ID",
      dataIndex: "formattedId",
      key: "formattedId",
    },
    {
      title: "Страна",
      dataIndex: "country",
      key: "country",
      sorter: (a, b) => a.country.localeCompare(b.country),
    },
    {
      title: "Тип визы",
      dataIndex: "visaType",
      key: "visaType",
      sorter: (a, b) => a.visaType.localeCompare(b.visaType),
    },
    {
      title: "Срок",
      dataIndex: "standardDuration",
      key: "standardDuration",
      render: formatDuration,
      sorter: (a, b) => {
        const aDuration = a.standardDuration || 0;
        const bDuration = b.standardDuration || 0;
        return aDuration - bDuration;
      },
    },
    {
      title: "Стоимость",
      dataIndex: "price",
      key: "price",
      render: formatPrice,
      sorter: (a, b) => {
        const aPrice = a.price || 0;
        const bPrice = b.price || 0;
        return aPrice - bPrice;
      },
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      filters: [
        { text: "Активная", value: "active" },
        { text: "Неактивная", value: "inactive" },
        { text: "Ожидание", value: "pending" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Действия",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown menu={actionMenu(record)} trigger={["click"]}>
          <Button
            type="text"
            icon={<DotsThreeOutline size={24} weight="fill" />}
          />
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
