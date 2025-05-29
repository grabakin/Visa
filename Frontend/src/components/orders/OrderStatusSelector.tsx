import React from "react";
import { Steps, Button, Space, Popover, Typography } from "antd";
import { ORDER_STATUSES } from "./constants";

const { Text } = Typography;

interface OrderStatusSelectorProps {
  currentStatus: string;
  onChange: (status: string) => void;
  simplified?: boolean;
}

export default function OrderStatusSelector({
  currentStatus,
  onChange,
  simplified = false,
}: OrderStatusSelectorProps) {
  // Find the index of the current status
  const getCurrentStatusIndex = () => {
    const status = ORDER_STATUSES.findIndex(
      s => s.value === currentStatus || s.label === currentStatus
    );
    return status >= 0 ? status : 0;
  };

  // Get status info by value or label
  const getStatusByValue = (value: string) => {
    return ORDER_STATUSES.find(
      s => s.value === value || s.label === value
    ) || ORDER_STATUSES[0];
  };
  
  const currentIndex = getCurrentStatusIndex();
  const currentStatusInfo = getStatusByValue(currentStatus);

  if (simplified) {
    return (
      <Space>
        {ORDER_STATUSES.map(status => (
          <Button
            key={status.value}
            type={status.value === currentStatusInfo.value ? 'primary' : 'default'}
            onClick={() => onChange(status.value)}
            size="small"
            disabled={status.value === currentStatusInfo.value}
          >
            {status.label}
          </Button>
        ))}
      </Space>
    );
  }

  return (
    <Steps
      current={currentIndex}
      onChange={(index) => onChange(ORDER_STATUSES[index].value)}
      items={ORDER_STATUSES.map((status, index) => ({
        title: status.label,
        description: (
          <Popover
            content={
              <div>
                <Text>Перейти к статусу "{status.label}"</Text>
              </div>
            }
            trigger="hover"
          >
            <div 
              style={{ 
                height: 8, 
                width: 50, 
                backgroundColor: status.color,
                cursor: currentIndex !== index ? 'pointer' : 'default',
                borderRadius: 4
              }}
              onClick={() => {
                if (currentIndex !== index) {
                  onChange(status.value);
                }
              }}
            />
          </Popover>
        ),
        status: 
          index < currentIndex 
            ? 'finish' 
            : index === currentIndex 
              ? 'process' 
              : 'wait'
      }))}
    />
  );
}
