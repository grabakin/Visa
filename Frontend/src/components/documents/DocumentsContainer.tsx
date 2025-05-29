import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  message,
  Tabs,
  Typography,
  Card,
  Divider,
  Space,
  Tag,
  Spin,
  Empty,
  Dropdown,
} from "antd";
import {
  MagnifyingGlass,
  Plus,
  Upload,
  FunnelSimple,
  CaretDown,
} from "phosphor-react";
import {
  getDocuments,
  getDocumentsByClient,
  getDocumentsByOrder,
  deleteDocument,
  type DocumentModel,
} from "../../utils/api/documentsApi";
import DocumentsTable from "./DocumentsTable.tsx";
import DocumentUploadForm from "./DocumentUploadForm.tsx";
import DocumentImportModal from "./DocumentImportModal.tsx";
import DocumentPreview from "./DocumentPreview.tsx";

const { Title, Text } = Typography;

export default function DocumentsContainer() {
  // State
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentModel | null>(null);
  const [clientId, setClientId] = useState<number | undefined>(undefined);
  const [orderId, setOrderId] = useState<number | undefined>(undefined);

  // Load documents on mount and when dependencies change
  useEffect(() => {
    fetchDocuments();
  }, [activeTab, clientId, orderId]);

  // Fetch documents based on active tab
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let data: DocumentModel[] = [];

      if (activeTab === "all") {
        data = await getDocuments();
      } else if (activeTab === "client" && clientId) {
        data = await getDocumentsByClient(clientId);
      } else if (activeTab === "order" && orderId) {
        data = await getDocumentsByOrder(orderId);
      } else {
        data = await getDocuments();
      }

      setDocuments(data);
    } catch (error) {
      message.error("Не удалось загрузить документы");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle document deletion
  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id);
      message.success("Документ успешно удален");
      fetchDocuments(); // Refresh document list
    } catch (error) {
      message.error("Не удалось удалить документ");
      console.error(error);
    }
  };

  // Handle document preview
  const handlePreview = (document: DocumentModel) => {
    setSelectedDocument(document);
    setIsPreviewVisible(true);
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Filter documents based on search text
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchText.toLowerCase();
    return (
      doc.formattedId?.toLowerCase().includes(searchLower) ||
      doc.docType?.toLowerCase().includes(searchLower) ||
      doc.clientName?.toLowerCase().includes(searchLower) ||
      doc.orderNumber?.toLowerCase().includes(searchLower) ||
      doc.fileName?.toLowerCase().includes(searchLower)
    );
  });

  // Tab change handler
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setClientId(undefined);
    setOrderId(undefined);
  };

  return (
    <Card
      className="document-container"
      bordered={false}
      style={{
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        borderRadius: "8px",
        background: "#fff",
      }}
    >
      {/* Header with title and action buttons */}
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
            Документы
          </Title>
          <Text type="secondary">
            Управление документами клиентов и заказов
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsUploadModalVisible(true)}
            size="middle"
          >
            Загрузить документ
          </Button>
          <Button
            icon={<Upload size={16} />}
            onClick={() => setIsImportModalVisible(true)}
          >
            Импортировать
          </Button>
        </Space>
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
          placeholder="Поиск документов"
          prefix={<MagnifyingGlass size={16} />}
          style={{ maxWidth: 300 }}
          value={searchText}
          onChange={handleSearch}
          allowClear
        />

        <Space>
          <Dropdown
            menu={{
              items: [
                { key: "recent", label: "Недавние" },
                { key: "oldest", label: "Старые" },
                { key: "name", label: "По имени" },
                { key: "type", label: "По типу" },
              ],
            }}
            trigger={["click"]}
          >
            <Button icon={<FunnelSimple size={16} />}>
              Сортировка <CaretDown size={12} />
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Tabs for document categories */}
      <Tabs
        defaultActiveKey="all"
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: "all",
            label: (
              <>
                <Tag color="blue">Все</Tag> Все документы
              </>
            ),
          },
          {
            key: "client",
            label: (
              <>
                <Tag color="green">Клиенты</Tag> Документы клиентов
              </>
            ),
          },
          {
            key: "order",
            label: (
              <>
                <Tag color="orange">Заказы</Tag> Документы заказов
              </>
            ),
          },
        ]}
        type="card"
        style={{ marginBottom: 16 }}
      />

      {/* Documents table with loading state and empty state */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Загрузка документов...</Text>
          </div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Empty
          description="Нет документов"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: "40px 0" }}
        />
      ) : (
        <DocumentsTable
          data={filteredDocuments}
          loading={loading}
          onDelete={handleDelete}
          onPreview={handlePreview}
          onRefresh={fetchDocuments}
        />
      )}

      {/* Upload document modal */}
      <DocumentUploadForm
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onSuccess={() => {
          setIsUploadModalVisible(false);
          fetchDocuments();
          message.success("Документ успешно загружен");
        }}
        clientId={clientId}
        orderId={orderId}
      />

      {/* Import documents modal */}
      <DocumentImportModal
        visible={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        onSuccess={() => {
          setIsImportModalVisible(false);
          fetchDocuments();
          message.success("Документы успешно импортированы");
        }}
      />

      {/* Document preview modal */}
      {selectedDocument && (
        <DocumentPreview
          visible={isPreviewVisible}
          document={selectedDocument}
          onCancel={() => setIsPreviewVisible(false)}
          onDelete={(id) => {
            handleDelete(id);
            setIsPreviewVisible(false);
          }}
        />
      )}

      {/* Add global styles */}
      <style>{`
        .document-container .ant-card-body {
          padding: 24px;
        }
        .document-container .ant-tabs-nav {
          margin-bottom: 16px;
        }
        .document-container .ant-tabs-tab {
          padding: 8px 16px;
        }
        .document-container .ant-table-thead > tr > th {
          background-color: #f5f5f5;
        }
      `}</style>
    </Card>
  );
}
