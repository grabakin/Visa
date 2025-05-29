import React, { useState } from "react";
import {
  Modal,
  Button,
  Descriptions,
  Space,
  Typography,
  Divider,
  Popconfirm,
  message,
  Spin,
  Card,
  Tag,
  Avatar,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  DownloadSimple,
  Trash,
  FileArrowDown,
  FileText,
  FileJpg,
  FilePdf,
  FileDoc,
  FileXls,
  CalendarBlank,
  User,
  ShoppingCart,
  ClockCounterClockwise,
  File,
} from "phosphor-react";
import type { DocumentModel } from "../../utils/api/documentsApi";
import { formatDate, formatFileSize } from "../../utils/formatters.ts";

const { Title, Text } = Typography;

interface DocumentPreviewProps {
  visible: boolean;
  document: DocumentModel;
  onCancel: () => void;
  onDelete: (id: number) => void;
}

export default function DocumentPreview({
  visible,
  document,
  onCancel,
  onDelete,
}: DocumentPreviewProps) {
  const [loading, setLoading] = useState(false);

  // Handle document download
  const handleDownload = () => {
    if (!document.docFile) {
      message.error("Файл документа недоступен");
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

  // Get file icon and color based on file type or extension
  const getFileInfo = () => {
    let icon = <FileText size={64} weight="thin" />;
    let color = "#8c8c8c";
    let bgColor = "#f5f5f5";

    // Determine color based on document type
    switch (document.docType) {
      case "Паспорт":
        color = "#1677ff";
        bgColor = "#e6f4ff";
        break;
      case "Виза":
        color = "#52c41a";
        bgColor = "#f6ffed";
        break;
      case "Анкета":
        color = "#fa8c16";
        bgColor = "#fff7e6";
        break;
      case "Квитанция":
        color = "#722ed1";
        bgColor = "#f9f0ff";
        break;
      case "Страховка":
        color = "#13c2c2";
        bgColor = "#e6fffb";
        break;
    }

    // Determine icon based on file extension
    if (document.fileName) {
      const extension = document.fileName.split(".").pop()?.toLowerCase();

      switch (extension) {
        case "pdf":
          icon = <FilePdf size={64} weight="thin" />;
          break;
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
          icon = <FileJpg size={64} weight="thin" />;
          break;
        case "doc":
        case "docx":
          icon = <FileDoc size={64} weight="thin" />;
          break;
        case "xls":
        case "xlsx":
          icon = <FileXls size={64} weight="thin" />;
          break;
        default:
          icon = <File size={64} weight="thin" />;
      }
    }

    return { icon, color, bgColor };
  };

  // Render file preview
  const renderFilePreview = () => {
    const { icon, color, bgColor } = getFileInfo();

    if (!document.docFile) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <Avatar
            icon={icon}
            size={100}
            style={{
              backgroundColor: bgColor,
              color: color,
              marginBottom: 16,
            }}
          />
          <Text type="secondary" style={{ display: "block", fontSize: 16 }}>
            Предпросмотр недоступен
          </Text>
        </div>
      );
    }

    const fileType = document.fileName?.split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileType || "");
    const isPdf = fileType === "pdf";

    // For images, show the image
    if (isImage) {
      const imageData = document.docFile.includes("base64,")
        ? document.docFile
        : `data:image/${fileType};base64,${document.docFile}`;

      return (
        <div
          style={{
            textAlign: "center",
            maxHeight: "500px",
            overflow: "auto",
            borderRadius: 8,
            background: "#f5f5f5",
            padding: 16,
          }}
        >
          <img
            src={imageData}
            alt={document.fileName || "Document preview"}
            style={{
              maxWidth: "100%",
              maxHeight: "500px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              borderRadius: 4,
            }}
          />
        </div>
      );
    }

    // For PDFs, show PDF viewer if possible
    if (isPdf) {
      const pdfData = document.docFile.includes("base64,")
        ? document.docFile
        : `data:application/pdf;base64,${document.docFile}`;

      return (
        <div
          style={{
            height: "600px",
            width: "100%",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <object
            data={pdfData}
            type="application/pdf"
            width="100%"
            height="100%"
          >
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                background: "#fafafa",
              }}
            >
              <Avatar
                icon={<FilePdf size={64} weight="thin" />}
                size={100}
                style={{
                  backgroundColor: "#fff2e8",
                  color: "#fa541c",
                  marginBottom: 16,
                }}
              />
              <Text
                type="secondary"
                style={{ display: "block", marginTop: 8, fontSize: 16 }}
              >
                PDF просмотрщик не поддерживается в вашем браузере
              </Text>
              <Button
                type="primary"
                icon={<FileArrowDown size={16} />}
                onClick={handleDownload}
                style={{ marginTop: 16 }}
              >
                Скачать PDF
              </Button>
            </div>
          </object>
        </div>
      );
    }

    // For other file types, show generic preview
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 0",
          background: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Avatar
          icon={icon}
          size={100}
          style={{
            backgroundColor: bgColor,
            color: color,
            marginBottom: 16,
          }}
        />
        <Text strong style={{ display: "block", fontSize: 18 }}>
          {document.fileName || `Документ ${document.formattedId}`}
        </Text>
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          Предпросмотр для данного типа файла недоступен
        </Text>
        <Button
          type="primary"
          icon={<DownloadSimple size={16} />}
          onClick={handleDownload}
          style={{ marginTop: 24 }}
        >
          Скачать файл
        </Button>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          {getFileInfo().icon}
          <span>{document.fileName || `Документ ${document.formattedId}`}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Popconfirm
          key="delete"
          title="Вы уверены, что хотите удалить этот документ?"
          onConfirm={() => onDelete(document.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button danger icon={<Trash size={16} />}>
            Удалить
          </Button>
        </Popconfirm>,
        <Button
          key="download"
          icon={<DownloadSimple size={16} />}
          onClick={handleDownload}
          disabled={!document.docFile}
        >
          Скачать
        </Button>,
        <Button key="close" type="primary" onClick={onCancel}>
          Закрыть
        </Button>,
      ]}
      width={800}
    >
      <Spin spinning={loading}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Document metadata */}
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="ID" span={2}>
              {document.formattedId}
            </Descriptions.Item>
            <Descriptions.Item label="Тип документа">
              {document.docType || "Не указан"}
            </Descriptions.Item>
            <Descriptions.Item label="Имя файла">
              {document.fileName || "Не указано"}
            </Descriptions.Item>
            <Descriptions.Item label="Клиент">
              {document.clientName || "Не связан"}
            </Descriptions.Item>
            <Descriptions.Item label="Заказ">
              {document.orderNumber || "Не связан"}
            </Descriptions.Item>
            <Descriptions.Item label="Дата загрузки">
              {formatDate(document.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Последнее обновление">
              {formatDate(document.updatedAt)}
            </Descriptions.Item>
          </Descriptions>

          <Divider>Предпросмотр документа</Divider>

          {/* Document preview */}
          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: 4,
              padding: 16,
            }}
          >
            {renderFilePreview()}
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
