import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/store";
import { roleMap } from "@/utils";
import { cn } from "@/utils";

interface RoleToastProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

function RoleToast({ visible, message, onClose }: RoleToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-slide-in">
      <div className="bg-gradient-to-r from-industrial-600 to-industrial-700 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
}

export default function Topbar() {
  const { currentUser, currentUserId, users, toggleSidebar, alerts, resetStore, setCurrentUser } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
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

  const handleSwitchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setCurrentUser(userId);
    setShowUserMenu(false);
    const roleLabel = roleMap[user.role] || user.role;
    setToastMessage(`已切换为 ${user.name}（${roleLabel}）视角`);
    setToastVisible(true);
  };

  return (
    <>
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
                  {currentUser.name} · {roleMap[currentUser.role] || currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-lg shadow-lg border border-slate-200 z-50 animate-slide-in overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
                  <p className="text-xs text-industrial-600 mt-0.5 font-medium">
                    当前角色：{roleMap[currentUser.role] || currentUser.role}
                  </p>
                </div>

                <div className="border-b border-slate-100 py-2">
                  <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    👤 以其他身份登录
                  </div>
                  <div className="max-h-[260px] overflow-y-auto">
                    {users.map((u) => {
                      const isSelected = u.id === currentUserId;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchUser(u.id)}
                          className={cn(
                            "w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors",
                            isSelected && "bg-industrial-50/60"
                          )}
                        >
                          <span className="flex-shrink-0 w-3 h-3 flex items-center justify-center">
                            {isSelected ? (
                              <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              </span>
                            ) : (
                              <span className="w-3 h-3 rounded-full border-2 border-slate-300" />
                            )}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-semibold shrink-0">
                            {u.avatar || u.name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm truncate",
                                isSelected ? "font-bold text-industrial-700" : "font-medium text-slate-700"
                              )}
                            >
                              {u.name}
                              <span className="text-slate-400 font-normal ml-1 text-xs">
                                （{roleMap[u.role] || u.role}）
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{u.dept}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
                  <button
                    onClick={() => {
                      if (window.confirm("确认将所有演示数据重置为初始状态？您修改过的内容将全部丢失。")) {
                        resetStore();
                        window.location.reload();
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-fire-600 hover:bg-fire-50 flex items-center gap-2.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重置演示数据
                  </button>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-slate-500" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <RoleToast
        visible={toastVisible}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
