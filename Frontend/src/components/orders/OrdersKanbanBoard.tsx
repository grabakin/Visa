import React, { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { OrderModel } from "../../types/models";
import { ORDER_STATUSES } from "./constants";
import { OrderCardContent } from "./OrderCard";
import KanbanColumn from "./KanbanColumn";

interface OrdersKanbanBoardProps {
  ordersByStatus: Record<string, OrderModel[]>;
  onStatusChange: (orderId: number, newStatus: string) => void;
  onOrderSelect: (order: OrderModel) => void;
  onOrderEdit: (order: OrderModel) => void;
}

export default function OrdersKanbanBoard({
  ordersByStatus,
  onStatusChange,
  onOrderSelect,
  onOrderEdit,
}: OrdersKanbanBoardProps) {
  // State for active dragging
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderModel | null>(null);

  // Sensors for drag interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    setActiveId(activeId);

    // Find the order being dragged
    const [statusValue, orderId] = activeId.split(":");
    const orderList = ordersByStatus[statusValue] || [];
    const draggedOrder = orderList.find(
      (order) => order.id === Number(orderId)
    );

    if (draggedOrder) {
      setActiveOrder(draggedOrder);
    }
  };

  // Handle drag over - this is for showing a preview in the right column
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Skip if hovering over the same item
    if (activeId === overId) return;

    // If the active and over items are from different columns
    const [activeStatus] = activeId.split(":");

    // If over a column header, treat it as hovering over the column
    if (overId.startsWith("column:")) {
      // This is a preview, but we don't commit changes yet
      return;
    }

    const [overStatus] = overId.split(":");

    // If dragging to a different status column, show a preview
    if (activeStatus !== overStatus) {
      // This is just a preview, the actual change happens on drag end
    }
  };

  // Handle drag end - this is where we actually commit the status change
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset active state
    setActiveId(null);
    setActiveOrder(null);

    if (!over) {
      console.log("No over element - drop outside valid area");
      return;
    }

    console.log("Drag end - active:", active, "over:", over);

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dragged to the same place, do nothing
    if (activeId === overId) {
      console.log("Same place - no status change");
      return;
    }

    // Get order ID from active element
    const [activeStatus, activeOrderIdStr] = activeId.split(":");
    const activeOrderId = Number(activeOrderIdStr);
    
    // Determine target status
    let targetStatus = "";

    // If over a column (column:statusValue)
    if (overId.startsWith("column:")) {
      console.log("Dropped on column");
      targetStatus = overId.replace("column:", "");
    } else {
      // If over another card, get that card's status
      console.log("Dropped on card");
      const [overStatus] = overId.split(":");
      targetStatus = overStatus;
    }

    console.log(`Status change: ${activeStatus} -> ${targetStatus} for order ${activeOrderId}`);

    // Only update if the status has changed
    if (activeStatus !== targetStatus) {
      // First update local state to show immediate visual feedback
      if (activeOrder) {
        // Make a copy of the active order with updated status
        const updatedOrder = { ...activeOrder, status: targetStatus };
        console.log("Updated order with new status:", updatedOrder);
      }

      // Then call the callback to update the backend
      onStatusChange(activeOrderId, targetStatus);
    } else {
      console.log("No status change needed");
    }
  };

  // Render drag overlay
  const renderDragOverlay = () => {
    if (!activeOrder) return null;

    return (
      <div style={{ width: 250, opacity: 0.8, transform: "rotate(3deg)" }}>
        <OrderCardContent order={activeOrder} />
      </div>
    );
  };

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {ORDER_STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            status={status}
            orders={ordersByStatus[status.value] || []}
            onOrderSelect={onOrderSelect}
          />
        ))}

        <DragOverlay>
          {activeId && activeOrder ? (
            <div
              style={{ width: 250, opacity: 0.8, transform: "rotate(3deg)" }}
            >
              <OrderCardContent order={activeOrder} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
