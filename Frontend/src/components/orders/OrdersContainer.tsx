import React, { useState, useEffect, useMemo } from "react";
import {
  Typography,
  Button,
  Input,
  Space,
  message,
  Card,
  Divider,
  Dropdown,
  Tag,
  Spin,
  Empty,
} from "antd";
import { Plus, MagnifyingGlass, FunnelSimple, CaretDown } from "phosphor-react";
import { getOrders, updateOrderStatus } from "../../utils/api/ordersApi";
import type { OrderModel } from "../../types/models";
import OrdersKanbanBoard from "./OrdersKanbanBoard.tsx";
import OrderForm from "./OrderForm.tsx";
import OrderDetails from "./OrderDetails.tsx";
import { ORDER_STATUSES } from "./constants";

const { Title, Text } = Typography;

export default function OrdersContainer() {
  // State
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isOrderFormVisible, setIsOrderFormVisible] = useState(false);
  const [isOrderDetailVisible, setIsOrderDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Helper to normalize status values
  const normalizeStatusValues = (ordersData: OrderModel[]): OrderModel[] => {
    return ordersData.map(order => {
      // If the status is a label instead of a value, map it to a value
      const statusValue = ORDER_STATUSES.find(s => s.label === order.status)?.value || 
                         ORDER_STATUSES.find(s => s.value === order.status)?.value || 
                         "new";
      
      console.log(`Normalizing order ${order.id} status from "${order.status}" to "${statusValue}"`);
      return {
        ...order,
        status: statusValue // Use the status value consistently
      };
    });
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get orders from API
      const data = await getOrders();
      console.log('Raw orders from API:', data);
      
      // Normalize status values to ensure consistency
      const normalizedOrders = normalizeStatusValues(data);
      console.log('Normalized orders:', normalizedOrders);
      
      // Update state with normalized orders
      setOrders(normalizedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      message.error("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by search text and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        order.formattedId.toLowerCase().includes(searchLower) ||
        order.clientName?.toLowerCase().includes(searchLower) ||
        order.workerName?.toLowerCase().includes(searchLower) ||
        order.serviceName?.toLowerCase().includes(searchLower) ||
        order.description?.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(order.status);

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchText, statusFilter]);

  // Group orders by status for the Kanban board
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, OrderModel[]> = {};

    // Initialize with all possible statuses
    ORDER_STATUSES.forEach((status) => {
      grouped[status.value] = [];
    });

    // Group orders by status
    filteredOrders.forEach((order) => {
      // First check if order.status is already a valid status value
      if (ORDER_STATUSES.some(s => s.value === order.status)) {
        // If it's already a valid value, use it directly
        const statusKey = order.status;
        grouped[statusKey].push(order);
      } else {
        // If it's a label or something else, try to map it to a value
        const statusKey =
          ORDER_STATUSES.find(s => s.label === order.status)?.value || "new";
        
        if (!grouped[statusKey]) grouped[statusKey] = [];
        grouped[statusKey].push(order);
        
        // Log if we had to do a conversion for debugging
        console.log(`Mapped order status "${order.status}" to status key "${statusKey}"`);
      }
    });

    return grouped;
  }, [filteredOrders]);

  // Handle order status change from Kanban board - Simplified direct approach
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      console.log(`STATUS CHANGE REQUEST - Order: ${orderId}, New status: ${newStatus}`);
      
      // Direct API call with minimal processing
      message.loading(`Обновление статуса заказа...`);
      
      // Optimistically update UI first
      setOrders((prev) => {
        return prev.map((order) => {
          if (order.id === orderId) {
            console.log(`Updating order ${orderId} from '${order.status}' to '${newStatus}'`);
            return { ...order, status: newStatus };
          }
          return order;
        });
      });
      
      // Make the API call - using the value directly
      await fetch(`http://localhost:5166/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`Status update failed: ${response.status}`);
        }
        return response.json();
      }).then(data => {
        console.log('Status update success:', data);
        message.success(`Статус заказа изменен`);
      });
      
    } catch (error) {
      console.error("ERROR updating order status:", error);
      message.error("Не удалось обновить статус заказа");
      fetchOrders(); // Revert by refreshing
    }
  };

  // Helper event handlers
  const handleOrderSelect = (order: OrderModel) => {
    setSelectedOrder(order);
    setIsOrderDetailVisible(true);
  };

  const handleOrderCreate = () => {
    setSelectedOrder(null);
    setIsOrderFormVisible(true);
  };

  const handleOrderEdit = (order: OrderModel) => {
    setSelectedOrder(order);
    setIsOrderFormVisible(true);
  };

  return (
    <Card
      className="orders-container"
      bordered={false}
      style={{
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        borderRadius: "8px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, fontSize: "24px" }}>
            Заказы
          </Title>
          <Text type="secondary">
            Управление заказами и отслеживание их статуса
          </Text>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleOrderCreate}
        >
          Новый заказ
        </Button>
      </div>

      <Divider style={{ margin: "12px 0 24px" }} />

      {/* Search and filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Input
          placeholder="Поиск заказов"
          prefix={<MagnifyingGlass size={16} />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Dropdown
          menu={{
            items: ORDER_STATUSES.map((status) => ({
              key: status.value,
              label: (
                <div
                  onClick={() => {
                    const newFilter = statusFilter.includes(status.value)
                      ? statusFilter.filter((s) => s !== status.value)
                      : [...statusFilter, status.value];
                    setStatusFilter(newFilter);
                  }}
                >
                  <Tag color={status.color}>{status.label}</Tag>
                </div>
              ),
            })),
          }}
          trigger={["click"]}
        >
          <Button icon={<FunnelSimple size={16} />}>
            Фильтр по статусу <CaretDown size={12} />
          </Button>
        </Dropdown>
      </div>

      {/* Filter tags */}
      {statusFilter.length > 0 && (
        <Space style={{ marginBottom: 16 }}>
          <Text>Фильтры:</Text>
          {statusFilter.map((status) => {
            const statusInfo = ORDER_STATUSES.find((s) => s.value === status);
            return (
              <Tag
                key={status}
                color={statusInfo?.color}
                closable
                onClose={() =>
                  setStatusFilter(statusFilter.filter((s) => s !== status))
                }
              >
                {statusInfo?.label || status}
              </Tag>
            );
          })}
          <Button type="link" size="small" onClick={() => setStatusFilter([])}>
            Сбросить все
          </Button>
        </Space>
      )}

      {/* Orders Kanban Board */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Загрузка заказов...</Text>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <Empty
          description="Нет заказов"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: "40px 0" }}
        />
      ) : (
        <OrdersKanbanBoard
          ordersByStatus={ordersByStatus}
          onStatusChange={handleStatusChange}
          onOrderSelect={handleOrderSelect}
          onOrderEdit={handleOrderEdit}
        />
      )}

      {/* Modals */}
      <OrderForm
        visible={isOrderFormVisible}
        order={selectedOrder}
        onCancel={() => setIsOrderFormVisible(false)}
        onSuccess={() => {
          setIsOrderFormVisible(false);
          fetchOrders();
          message.success(
            selectedOrder ? "Заказ успешно обновлен" : "Заказ успешно создан"
          );
        }}
      />

      {selectedOrder && (
        <OrderDetails
          visible={isOrderDetailVisible}
          order={selectedOrder}
          onCancel={() => setIsOrderDetailVisible(false)}
          onEdit={() => {
            setIsOrderDetailVisible(false);
            setIsOrderFormVisible(true);
          }}
          onStatusChange={async (newStatus) => {
            await handleStatusChange(selectedOrder.id, newStatus);
            setSelectedOrder({ ...selectedOrder, status: newStatus });
          }}
        />
      )}

      {/* Styles */}
      <style>{`
        .orders-container .ant-card-body {
          padding: 24px;
        }
        .orders-container .kanban-board {
          min-height: 600px;
          display: flex;
          overflow-x: auto;
          padding-bottom: 16px;
        }
        .orders-container .kanban-column {
          min-width: 280px;
          margin-right: 16px;
          background: #f5f5f5;
          border-radius: 8px;
          height: fit-content;
        }
        .orders-container .kanban-column-header {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e8e8e8;
        }
        .orders-container .order-card {
          margin-bottom: 8px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .orders-container .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Card>
  );
}
