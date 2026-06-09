import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/store";
import { roleMap } from "@/utils";
import { cn } from "@/utils";

export default function Topbar() {
  const { currentUser, toggleSidebar, alerts } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 h-[60px] bg-white border-b border-slate-200 z-30 flex items-center px-5 gap-4 shadow-sm">
      <button
        onClick={toggleSidebar}
        className="w-9 h-9 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0 lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索建筑、设备、巡检任务..."
            className="w-full h-9 pl-10 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-industrial-500/20 focus:border-industrial-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-1">
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative w-9 h-9 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-fire-500 text-white text-[11px] font-medium flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-lg shadow-lg border border-slate-200 z-50 animate-slide-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">通知消息</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-industrial-600 font-medium cursor-pointer hover:underline">
                    全部已读
                  </span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    暂无新通知
                  </div>
                ) : (
                  alerts.slice(0, 8).map((alert) => (
                    <div
                      key={alert.id}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                            alert.level === "danger"
                              ? "bg-fire-500"
                              : alert.level === "warning"
                              ? "bg-warning-500"
                              : "bg-industrial-500"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {alert.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {alert.description}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                <span className="text-xs text-industrial-600 font-medium cursor-pointer hover:underline">
                  查看全部通知
                </span>
              </div>
            </div>
          )}
        </div>

        <div ref={userMenuRef} className="relative ml-1">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2.5 h-9 pl-1 pr-2.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover bg-slate-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-industrial-100 flex items-center justify-center text-industrial-700 text-xs font-semibold">
                {currentUser.name.slice(0, 1)}
              </div>
            )}
            <div className="hidden sm:flex flex-col items-start text-left leading-tight">
              <span className="text-sm font-medium text-slate-800">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500">
                {roleMap[currentUser.role] || currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-lg shadow-lg border border-slate-200 z-50 animate-slide-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  个人中心
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-500" />
                  账户设置
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-fire-600 hover:bg-fire-50 flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
