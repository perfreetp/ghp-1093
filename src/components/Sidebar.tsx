import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Warehouse,
  ClipboardCheck,
  AlertTriangle,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useAppStore } from "@/store";
import { cn } from "@/utils";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  name: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, path: "/", name: "总览" },
  { icon: Building2, path: "/buildings", name: "建筑档案" },
  { icon: Warehouse, path: "/devices", name: "设备台账" },
  { icon: ClipboardCheck, path: "/inspections", name: "巡检任务" },
  { icon: AlertTriangle, path: "/hazards", name: "隐患整改" },
  { icon: Users, path: "/drills", name: "演练记录" },
  { icon: BarChart3, path: "/reports", name: "统计报表" },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-industrial-600 flex flex-col transition-all duration-300 ease-in-out z-40",
        sidebarCollapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div
        className={cn(
          "h-[60px] flex items-center border-b border-industrial-700/50 shrink-0",
          sidebarCollapsed ? "justify-center px-2" : "px-5 gap-3"
        )}
      >
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <span className="text-white font-semibold text-base leading-tight">消防巡检</span>
            <span className="text-industrial-200 text-xs leading-tight">管理平台</span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                      sidebarCollapsed && "justify-center px-0",
                      isActive
                        ? "bg-white text-industrial-700 shadow-md"
                        : "text-industrial-100 hover:bg-industrial-500/60 hover:text-white"
                    )
                  }
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      sidebarCollapsed ? "mx-auto" : ""
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={toggleSidebar}
        className={cn(
          "h-11 border-t border-industrial-700/50 flex items-center justify-center text-industrial-200 hover:text-white hover:bg-industrial-500/60 transition-all duration-150 shrink-0",
          sidebarCollapsed ? "px-0" : "px-4 justify-end"
        )}
        title={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <span className="text-xs mr-2">折叠菜单</span>
            <ChevronLeft className="w-5 h-5" />
          </>
        )}
      </button>
    </aside>
  );
}
