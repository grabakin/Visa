import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Descriptions, 
  Button, 
  Space, 
  Typography, 
  Divider, 
  Tag, 
  Tabs,
  Timeline,
  List,
  Avatar,
  Card,
  Empty
} from "antd";
import { 
  PencilSimple, 
  CalendarBlank, 
  User, 
  ShoppingCart, 
  Clock, 
  ClipboardText, 
  CurrencyCircleDollar,
  Files
} from "phosphor-react";
import type { OrderModel } from "../../types/models";
import { getDocumentsByOrder } from "../../utils/api/documentsApi";
import { ORDER_STATUSES } from "./constants";
import { formatDate, formatCurrency } from "../../utils/formatters";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface OrderDetailsProps {
  visible: boolean;
  order: OrderModel;
  onCancel: () => void;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
}

export default function OrderDetails({
  visible,
  order,
  onCancel,
  onEdit,
  onStatusChange,
}: OrderDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [orderFiles, setOrderFiles] = useState<any[]>([]);

  // Load order documents when modal becomes visible
  useEffect(() => {
    if (visible && order) {
      fetchOrderDocuments();
    }
  }, [visible, order]);

  // Fetch documents associated with this order
  const fetchOrderDocuments = async () => {
    if (!order) return;
    
    setLoading(true);
    try {
      const documents = await getDocumentsByOrder(order.id);
      setOrderFiles(documents);
    } catch (error) {
      console.error("Failed to fetch order documents:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return null;
  }

  // Get the appropriate status tag color
  const getStatusInfo = () => {
    const statusInfo = ORDER_STATUSES.find(
      s => s.label === order.status || s.value === order.status
    );
    return statusInfo || { value: 'unknown', label: order.status, color: 'default' };
  };

  // Calculate remaining days to deadline
  const getDaysRemaining = () => {
    if (!order.deadline) return null;
    
    const today = new Date();
    const deadline = new Date(order.deadline);
    const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { days: Math.abs(daysRemaining), text: "дней просрочено", color: "#f5222d" };
    } else if (daysRemaining === 0) {
      return { days: 0, text: "сегодня", color: "#fa8c16" };
    } else {
      return { days: daysRemaining, text: "дней осталось", color: "#52c41a" };
    }
  };

  const daysInfo = getDaysRemaining();
  const statusInfo = getStatusInfo();

  return (
    <Modal
      title={
        <Space>
          <ShoppingCart size={24} />
          <span>Заказ {order.formattedId}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Закрыть
        </Button>,
        <Button
          key="edit"
          type="primary"
          icon={<PencilSimple size={16} />}
          onClick={onEdit}
        >
          Редактировать
        </Button>,
      ]}
      width={800}
    >
      <Divider />
      
      {/* Order header with status and actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Space>
          <Tag color={statusInfo.color} style={{ padding: '4px 8px' }}>
            {statusInfo.label}
          </Tag>
          {daysInfo && (
            <Text style={{ color: daysInfo.color }}>
              <Clock size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {daysInfo.days} {daysInfo.text}
            </Text>
          )}
        </Space>
        
        <Space>
          {ORDER_STATUSES.map(status => (
            <Button
              key={status.value}
              type={status.value === statusInfo.value ? 'primary' : 'default'}
              onClick={() => onStatusChange(status.value)}
              size="small"
              disabled={status.value === statusInfo.value}
            >
              {status.label}
            </Button>
          ))}
        </Space>
      </div>
      
      {/* Order tabs */}
      <Tabs defaultActiveKey="details">
        <TabPane 
          tab={<span><ClipboardText size={16} style={{ marginRight: 8 }} />Основная информация</span>} 
          key="details"
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="ID заказа" span={2}>
              {order.formattedId}
            </Descriptions.Item>
            
            <Descriptions.Item label="Клиент" span={2}>
              <Space>
                <Avatar icon={<User />} />
                {order.clientName || "Не указан"}
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Услуга" span={2}>
              {order.serviceName || "Не указана"}
            </Descriptions.Item>
            
            <Descriptions.Item label="Ответственный сотрудник">
              {order.workerName || "Не назначен"}
            </Descriptions.Item>
            
            <Descriptions.Item label="Стоимость">
              <Text strong style={{ color: "#52c41a" }}>
                {formatCurrency(order.cost)}
              </Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Дата заказа">
              {formatDate(order.orderDate)}
            </Descriptions.Item>
            
            <Descriptions.Item label="Срок выполнения">
              {order.deadline ? formatDate(order.deadline) : "Не указан"}
            </Descriptions.Item>
            
            <Descriptions.Item label="Описание" span={2}>
              {order.description || "Нет описания"}
            </Descriptions.Item>
            
            <Descriptions.Item label="Дата создания">
              {formatDate(order.createdAt)}
            </Descriptions.Item>
            
            <Descriptions.Item label="Последнее обновление">
              {formatDate(order.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
        
        <TabPane 
          tab={<span><Files size={16} style={{ marginRight: 8 }} />Документы</span>} 
          key="documents"
        >
          {orderFiles.length === 0 ? (
            <Empty 
              description="Нет связанных документов" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={orderFiles}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Button type="link" key="view">Просмотр</Button>,
                    <Button type="link" key="download">Скачать</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<Files size={20} />} />}
                    title={<Text>{item.fileName || item.formattedId}</Text>}
                    description={item.docType || "Документ"}
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
}
