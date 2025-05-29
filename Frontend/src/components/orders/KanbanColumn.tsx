import React from "react";
import { Tag, Badge, Space } from "antd";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { OrderModel } from "../../types/models";
import { SortableOrderCard } from "./OrderCard";

interface KanbanColumnProps {
  status: {
    value: string;
    label: string;
    color: string;
  };
  orders: OrderModel[];
  onOrderSelect: (order: OrderModel) => void;
}

export default function KanbanColumn({
  status,
  orders,
  onOrderSelect,
}: KanbanColumnProps) {
  // Make the entire column a droppable area using @dnd-kit/core
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${status.value}`,
    data: {
      accepts: "order",
      status: status.value,
    },
  });

  // Visual styles for when a card is being dragged over this column
  const columnStyle = {
    backgroundColor: isOver ? "#f0f8ff" : "#fff", // Light blue background when dragging over
    borderRadius: "8px",
    border: isOver ? "1px dashed #1890ff" : "1px solid #f0f0f0",
    padding: "12px",
    transition: "background-color 0.2s, border 0.2s",
  };

  return (
    <div className="kanban-column" style={columnStyle} ref={setNodeRef}>
      <div className="kanban-column-header">
        <Space>
          <Tag color={status.color}>{status.label}</Tag>
          <Badge
            count={orders?.length || 0}
            style={{ backgroundColor: "#8c8c8c" }}
          />
        </Space>
      </div>
      <div
        style={{
          padding: "8px",
          minHeight: "200px",
          maxHeight: "calc(100vh - 280px)",
          overflowY: "auto",
        }}
      >
        <SortableContext
          items={orders?.map((order) => `${status.value}:${order.id}`) || []}
          strategy={rectSortingStrategy}
        >
          {orders?.map((order) => (
            <SortableOrderCard
              key={`${status.value}:${order.id}`}
              id={`${status.value}:${order.id}`}
              order={order}
              onSelect={() => onOrderSelect(order)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
