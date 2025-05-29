import React from "react";
import { Card, Typography, Tag, Avatar } from "antd";
import { CalendarBlank, User, CurrencyCircleDollar } from "phosphor-react";
import type { OrderModel } from "../../types/models";
import { formatCurrency } from "../../utils/formatters";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { Text } = Typography;

// Order card content component
export interface OrderCardContentProps {
  order: OrderModel;
}

export function OrderCardContent({ order }: OrderCardContentProps) {
  // Function to get priority styling
  const getPriorityStyle = () => {
    // Calculate days remaining to deadline
    if (!order.deadline) return { color: "#8c8c8c", text: "Нет срока" };

    const today = new Date();
    const deadline = new Date(order.deadline);
    const daysRemaining = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) {
      return { color: "#f5222d", text: "Просрочено" };
    } else if (daysRemaining === 0) {
      return { color: "#fa8c16", text: "Сегодня" };
    } else if (daysRemaining <= 3) {
      return { color: "#faad14", text: `${daysRemaining} дн.` };
    } else {
      return { color: "#52c41a", text: `${daysRemaining} дн.` };
    }
  };

  const priorityStyle = getPriorityStyle();

  return (
    <>
      <div
        style={{
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Text strong style={{ fontSize: 14 }}>
          {order.formattedId}
        </Text>
        {order.deadline && (
          <Tag color={priorityStyle.color}>
            <CalendarBlank size={12} style={{ marginRight: 4 }} />
            {priorityStyle.text}
          </Tag>
        )}
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 14 }}>
          {order.serviceName || "Услуга не указана"}
        </Text>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <Avatar
          size="small"
          icon={<User size={12} />}
          style={{ marginRight: 8 }}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {order.clientName || "Клиент не указан"}
        </Text>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong style={{ fontSize: 14, color: "#52c41a" }}>
          <CurrencyCircleDollar size={14} style={{ marginRight: 4 }} />
          {formatCurrency(order.cost)}
        </Text>

        <Text type="secondary" style={{ fontSize: 12 }}>
          {order.workerName || "Сотрудник не указан"}
        </Text>
      </div>
    </>
  );
}

// Sortable order card component
export interface SortableOrderCardProps {
  id: string;
  order: OrderModel;
  onSelect: () => void;
}

export function SortableOrderCard({
  id,
  order,
  onSelect,
}: SortableOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="order-card"
        onClick={onSelect}
        style={{ marginBottom: 8 }}
        bodyStyle={{ padding: "12px" }}
      >
        <OrderCardContent order={order} />
      </Card>
    </div>
  );
}
