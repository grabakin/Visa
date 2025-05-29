import React from "react";
import {
  Table,
  Button,
  Popconfirm,
  Tag,
  Space,
  Tooltip,
  Typography,
  Avatar,
} from "antd";
import {
  Eye,
  DownloadSimple,
  PencilSimple,
  Trash,
  FilePdf,
  FileJpg,
  FileDoc,
  FileXls,
  File,
} from "phosphor-react";
import type { DocumentModel } from "../../utils/api/documentsApi";
import { formatDate, formatFileSize } from "../../utils/formatters.ts";

const { Text } = Typography;

interface DocumentsTableProps {
  data: DocumentModel[];
  loading: boolean;
  onDelete: (id: number) => void;
  onPreview: (document: DocumentModel) => void;
  onRefresh: () => void;
}

export default function DocumentsTable({
  data,
  loading,
  onDelete,
  onPreview,
  onRefresh,
}: DocumentsTableProps) {
  // Document type color and icon mapping
  const getDocTypeInfo = (docType?: string, fileName?: string) => {
    let color = "default";
    let icon = <File size={20} weight="thin" />;

    // Determine color based on document type
    switch (docType) {
      case "Паспорт":
        color = "blue";
        break;
      case "Виза":
        color = "green";
        break;
      case "Анкета":
        color = "orange";
        break;
      case "Квитанция":
        color = "purple";
        break;
      case "Страховка":
        color = "cyan";
        break;
      case "Бронь отеля":
        color = "magenta";
        break;
      case "Авиабилет":
        color = "gold";
        break;
      default:
        color = "default";
    }

    // Determine icon based on file extension
    if (fileName) {
      const extension = fileName.split(".").pop()?.toLowerCase();
      switch (extension) {
        case "pdf":
          icon = <FilePdf size={20} weight="thin" />;
          break;
        case "jpg":
        case "jpeg":
        case "png":
          icon = <FileJpg size={20} weight="thin" />;
          break;
        case "doc":
        case "docx":
          icon = <FileDoc size={20} weight="thin" />;
          break;
        case "xls":
        case "xlsx":
          icon = <FileXls size={20} weight="thin" />;
          break;
      }
    }

    return { color, icon };
  };

  // Download document handler
  const handleDownload = (document: DocumentModel) => {
    if (!document.docFile) {
      return;
    }

    // Create a link element
    const link = document.docFile.includes("base64,")
      ? document.docFile
      : `data:application/octet-stream;base64,${document.docFile}`;

    const a = window.document.createElement("a");
    a.href = link;
    a.download = document.fileName || `${document.formattedId}.pdf`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  // Table columns
  const columns = [
    {
      title: "Документ",
      key: "document",
      width: 320,
      render: (record: DocumentModel) => {
        const { color, icon } = getDocTypeInfo(record.docType, record.fileName);
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              shape="square"
              size={40}
              style={{
                backgroundColor:
                  color !== "default"
                    ? `var(--ant-color-${color}-1)`
                    : "#f5f5f5",
                color:
                  color !== "default" ? `var(--ant-color-${color}-7)` : "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
              icon={icon}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text strong style={{ marginBottom: 4 }}>
                {record.fileName || `Документ ${record.formattedId}`}
              </Text>
              <Space size={4}>
                <Tag color={color}>{record.docType || "Не указан"}</Tag>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.formattedId}
                </Text>
              </Space>
            </div>
          </div>
        );
      },
    },
    {
      title: "Связан с",
      key: "relatedTo",
      width: 250,
      render: (record: DocumentModel) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Space>
            <Text type="secondary">Клиент:</Text>
            <Text>
              {record.clientName || <Text type="secondary">Не связан</Text>}
            </Text>
          </Space>
          <Space>
            <Text type="secondary">Заказ:</Text>
            <Text>
              {record.orderNumber || <Text type="secondary">Не связан</Text>}
            </Text>
          </Space>
        </div>
      ),
    },
    {
      title: "Загружен",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
      width: 150,
      sorter: (a: DocumentModel, b: DocumentModel) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      },
    },
    {
      title: "Действия",
      key: "actions",
      width: 150,
      render: (_: any, record: DocumentModel) => (
        <Space>
          <Tooltip title="Просмотр">
            <Button
              type="text"
              icon={<Eye size={20} weight="fill" />}
              onClick={() => onPreview(record)}
              style={{ color: "#1668dc" }}
            />
          </Tooltip>

          <Tooltip title="Скачать">
            <Button
              type="text"
              icon={<DownloadSimple size={20} weight="fill" />}
              onClick={() => handleDownload(record)}
              disabled={!record.docFile}
              style={{ color: "#52c41a" }}
            />
          </Tooltip>

          <Popconfirm
            title="Вы уверены, что хотите удалить этот документ?"
            onConfirm={() => onDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="text"
              danger
              icon={<Trash size={20} weight="fill" />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data.map((doc) => ({ ...doc, key: doc.id }))}
      loading={loading}
      pagination={{ pageSize: 10 }}
      rowKey="id"
      locale={{ emptyText: "Нет документов" }}
    />
  );
}
