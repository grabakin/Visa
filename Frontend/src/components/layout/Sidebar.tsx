import React, { useState } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  House,
  User,
  Files,
  UsersThree,
  ShoppingCart,
  Gear,
  FileText,
  ChartBar,
} from "phosphor-react";
// Near the top of your file, after imports
const Logo = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <div
      style={{
        height: 40,
        margin: 16,
        background: "#1A1F71",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        overflow: "hidden",
        width: collapsed ? 48 : "auto",
        minWidth: collapsed ? 48 : 168,
        transition: "all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1)", // Match Ant Design's transition
      }}
    >
      <span
        style={{
          color: "white",
          fontWeight: 600,
          fontSize: 16,
          whiteSpace: "nowrap",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          transition: "opacity 0.2s", // Add transition for content change
          opacity: 1,
        }}
      >
        {collapsed ? "V" : "VISA CRM"}
      </span>
    </div>
  );
};

// Then in your Sidebar component, replace the current logo div with:

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

export default function Sidebar(): React.ReactNode {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Get current path for highlighting the active menu item
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  const menuItems: MenuItem[] = [
    { key: "/", icon: <House size={20} weight="regular" />, label: "Дашборд" },
    {
      key: "/clients",
      icon: <User size={20} weight="regular" />,
      label: "Клиенты",
    },
    {
      key: "/services",
      icon: <ShoppingCart size={20} weight="regular" />,
      label: "Услуги",
    },
    {
      key: "/workers",
      icon: <UsersThree size={20} weight="regular" />,
      label: "Работники",
    },
    {
      key: "/documents",
      icon: <Files size={20} weight="regular" />,
      label: "Документы",
    },
    {
      key: "/orders",
      icon: <FileText size={20} weight="regular" />,
      label: "Заказы",
    },
    {
      key: "/reports",
      icon: <ChartBar size={20} weight="regular" />,
      label: "Отчеты",
    },
    {
      key: "/settings",
      icon: <Gear size={20} weight="regular" />,
      label: "Настройки",
    },
  ];

  const handleNavigation = ({ key }: { key: string }): void => {
    window.location.href = key;
  };

  return (
    <Sider
      theme="light"
      breakpoint="lg"
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{ height: "100vh", position: "sticky", top: 0 }}
    >
      <Logo collapsed={collapsed} />
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[path]}
        items={menuItems}
        onClick={handleNavigation}
      />
    </Sider>
  );
}
