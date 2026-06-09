import { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Settings,
  Pencil,
  X,
  Flame,
  Droplets,
  Siren,
  Radio,
  Bell,
  MapPin,
  Building2,
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  Save,
  Trash2,
  Shield,
  Lightbulb,
  FileText,
  User,
  DollarSign,
  Camera,
  ChevronRight,
  Circle,
  Eye,
  ClipboardList,
  History,
  Info,
} from "lucide-react";
import { useAppStore } from "@/store";
import {
  cn,
  deviceTypeMap,
  deviceStatusMap,
  checkCycleMap,
  daysUntil,
  isOverdue,
  priorityMap,
  maintenanceTypeMap,
  maintenanceStatusMap,
  roleMap,
} from "@/utils";
import type { Device, DeviceType, CheckCycle, DeviceStatus, MaintenanceOrder, MaintenanceType } from "@/types";

type TabType = "all" | DeviceType | "maintenance";

const tabs: { value: TabType; label: string; icon: string }[] = [
  { value: "all", label: "全部", icon: "" },
  { value: "fire_extinguisher", label: "灭火器", icon: "🧯" },
  { value: "sprinkler", label: "喷淋", icon: "💧" },
  { value: "fire_hydrant", label: "消防栓", icon: "🚰" },
  { value: "smoke_detector", label: "烟感", icon: "📡" },
  { value: "fire_alarm", label: "报警", icon: "🔔" },
  { value: "emergency_light", label: "应急照明", icon: "💡" },
  { value: "maintenance", label: "维修/保养", icon: "📋" },
];

const deviceTypeBg: Record<DeviceType, string> = {
  fire_extinguisher: "bg-fire-50 border-fire-100 text-fire-600",
  sprinkler: "bg-blue-50 border-blue-100 text-blue-600",
  fire_hydrant: "bg-industrial-50 border-industrial-100 text-industrial-600",
  smoke_detector: "bg-purple-50 border-purple-100 text-purple-600",
  fire_alarm: "bg-amber-50 border-amber-100 text-amber-600",
  emergency_light: "bg-yellow-50 border-yellow-100 text-yellow-600",
};

const deviceTypeIconCmp: Record<DeviceType, typeof Flame> = {
  fire_extinguisher: Flame,
  sprinkler: Droplets,
  fire_hydrant: Siren,
  smoke_detector: Radio,
  fire_alarm: Bell,
  emergency_light: Lightbulb,
};

const statusDotClass: Record<string, string> = {
  normal: "bg-safe-500 status-dot-normal",
  warning: "bg-risk-500",
  expired: "bg-fire-500 status-dot-expired",
  maintenance: "bg-industrial-500",
};

const statusIconCmp: Record<string, typeof CheckCircle2> = {
  normal: CheckCircle2,
  warning: AlertTriangle,
  expired: XCircle,
  maintenance: Wrench,
};

const deviceTypeOptions: { value: DeviceType; label: string }[] = [
  { value: "fire_extinguisher", label: "灭火器" },
  { value: "sprinkler", label: "喷淋系统" },
  { value: "fire_hydrant", label: "消防栓" },
  { value: "smoke_detector", label: "烟感探测器" },
  { value: "fire_alarm", label: "报警主机" },
  { value: "emergency_light", label: "应急照明" },
];

const deviceStatusOptions: { value: DeviceStatus; label: string }[] = [
  { value: "normal", label: "正常" },
  { value: "warning", label: "预警" },
  { value: "expired", label: "过期" },
  { value: "maintenance", label: "维修中" },
];

const checkCycleOptions: { value: CheckCycle; label: string }[] = [
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
  { value: "quarterly", label: "每季度" },
  { value: "half_year", label: "每半年" },
  { value: "yearly", label: "每年" },
];

const priorityOptions: { value: "high" | "medium" | "low"; label: string; className: string }[] = [
  { value: "high", label: "高优先级", className: "text-fire-600 font-semibold" },
  { value: "medium", label: "中优先级", className: "text-warning-600 font-semibold" },
  { value: "low", label: "低优先级", className: "text-safe-600 font-semibold" },
];

type MaintTabType = "all" | "pending" | "in_progress" | "completed";

const maintTabs: { value: MaintTabType; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待处理" },
  { value: "in_progress", label: "处理中" },
  { value: "completed", label: "已完成" },
];

function Toast({ message, onClose, type = "success" }: { message: string; onClose: () => void; type?: "success" | "error" }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
      <div
        className={cn(
          "px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-white",
          type === "success" ? "bg-safe-600" : "bg-fire-600"
        )}
      >
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

function CheckCycleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { devices, updateDeviceCheckCycle } = useAppStore();
  const deviceTypes: DeviceType[] = [
    "fire_extinguisher",
    "sprinkler",
    "fire_hydrant",
    "smoke_detector",
    "fire_alarm",
    "emergency_light",
  ];

  const [cycles, setCycles] = useState<Record<DeviceType, CheckCycle>>(() => {
    const init: Record<string, CheckCycle> = {};
    deviceTypes.forEach((t) => {
      const found = devices.find((d) => d.type === t);
      init[t] = found?.checkCycle || "monthly";
    });
    return init as Record<DeviceType, CheckCycle>;
  });

  const handleSave = () => {
    deviceTypes.forEach((t) => {
      updateDeviceCheckCycle(t, cycles[t]);
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-[520px] animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-industrial-600" />
            检查周期配置
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {deviceTypes.map((t) => {
            const IconCmp = deviceTypeIconCmp[t];
            return (
              <div
                key={t}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center",
                      deviceTypeBg[t]
                    )}
                  >
                    <IconCmp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">
                      {deviceTypeMap[t].icon} {deviceTypeMap[t].label}
                    </div>
                    <div className="text-xs text-slate-400">
                      共 {devices.filter((d) => d.type === t).length} 台设备
                    </div>
                  </div>
                </div>
                <select
                  value={cycles[t]}
                  onChange={(e) =>
                    setCycles((c) => ({ ...c, [t]: e.target.value as CheckCycle }))
                  }
                  className="input w-32 text-right"
                >
                  {checkCycleOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="btn-outline">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary">
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}

function DeviceCard({
  device,
  onEdit,
  onDelete,
  onCreateMaint,
  onViewMaint,
  onViewHistory,
}: {
  device: Device;
  onEdit: (d: Device) => void;
  onDelete: (id: string) => void;
  onCreateMaint: (d: Device) => void;
  onViewMaint: (moId: string) => void;
  onViewHistory: (deviceId: string) => void;
}) {
  const { maintenanceOrders } = useAppStore();
  const daysLeft = daysUntil(device.nextCheckDate);
  const overdue = isOverdue(device.nextCheckDate);
  const cycleDays: Record<CheckCycle, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    half_year: 180,
    yearly: 365,
  };
  const totalDays = cycleDays[device.checkCycle] || 30;
  const progress = overdue
    ? 100
    : Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));

  const progressColor = overdue
    ? "bg-fire-500"
    : progress > 80
    ? "bg-warning-500"
    : "bg-safe-500";

  const IconCmp = deviceTypeIconCmp[device.type];
  const StatusIcon = statusIconCmp[device.status];

  const hasAction = device.status === "warning" || device.status === "expired" || device.status === "maintenance";
  const currentOrder = device.currentMaintenanceId
    ? maintenanceOrders.find((o) => o.id === device.currentMaintenanceId)
    : null;

  const historyCount = device.maintenanceHistory?.length || 0;

  return (
    <div className="card p-5 relative group overflow-hidden">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
        <button
          onClick={() => onEdit(device)}
          title="编辑"
          className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-industrial-600 hover:border-industrial-200 hover:bg-industrial-50 shadow-sm transition-all"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(device.id)}
          title="删除"
          className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-fire-600 hover:border-fire-200 hover:bg-fire-50 shadow-sm transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0",
            deviceTypeBg[device.type]
          )}
        >
          <IconCmp className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-800 truncate pr-2">
              {deviceTypeMap[device.type].icon} {device.name}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  statusDotClass[device.status]
                )}
              />
              <span className="text-xs font-medium text-slate-500">
                {deviceStatusMap[device.status].label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{device.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{device.buildingName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
          <div className="text-slate-400 mb-0.5">型号</div>
          <div className="font-mono text-slate-700 font-medium truncate">
            {device.model}
          </div>
        </div>
        <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
          <div className="text-slate-400 mb-0.5">编号</div>
          <div className="font-mono text-slate-700 font-medium truncate">
            {device.code}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1 text-slate-500">
            <CalendarClock className="w-3.5 h-3.5" />
            下次检查
          </div>
          <div
            className={cn(
              "flex items-center gap-1 font-medium",
              overdue
                ? "text-fire-600"
                : daysLeft <= 7
                ? "text-warning-600"
                : "text-slate-600"
            )}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {device.nextCheckDate}
            {overdue ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-fire-50 text-fire-600 border border-fire-100">
                已超期{Math.abs(daysLeft)}天
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">
                剩{daysLeft}天
              </span>
            )}
          </div>
        </div>
        <div className="progress-bar">
          <div
            className={cn("progress-fill", progressColor)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            上次检查：{device.lastCheckDate}
          </div>
          <span
            className={cn(
              "badge",
              deviceStatusMap[device.status].className
            )}
          >
            {checkCycleMap[device.checkCycle]}
          </span>
        </div>

        {hasAction ? (
          <>
            {(device.status === "warning" || device.status === "expired") && (
              <button
                onClick={() => onCreateMaint(device)}
                className="w-full mt-2 py-2 rounded-lg bg-warning-50 border border-warning-200 text-warning-700 text-sm font-semibold hover:bg-warning-100 hover:border-warning-300 transition-all flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                🛠️ 发起维修/保养
              </button>
            )}
            {device.status === "maintenance" && currentOrder && (
              <button
                onClick={() => onViewMaint(currentOrder.id)}
                className="w-full mt-2 py-2 rounded-lg bg-industrial-50 border border-industrial-200 text-industrial-700 text-sm font-semibold hover:bg-industrial-100 hover:border-industrial-300 transition-all flex items-center justify-center gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                📋 查看维修进度
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => onViewHistory(device.id)}
            className="w-full mt-2 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-sm hover:bg-slate-100 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <History className="w-4 h-4" />
            保养记录 {historyCount > 0 && `(${historyCount})`}
          </button>
        )}
      </div>
    </div>
  );
}

function DeviceFormModal({
  open,
  device,
  onClose,
  onSave,
}: {
  open: boolean;
  device: Device | null;
  onClose: () => void;
  onSave: (data: Omit<Device, "id" | "buildingName"> & { buildingId: string }, isEdit: boolean, id?: string) => void;
}) {
  const isEdit = !!device;
  const { buildings } = useAppStore();

  const today = new Date().toISOString().slice(0, 10);

  const emptyForm = {
    code: "",
    name: "",
    type: "fire_extinguisher" as DeviceType,
    buildingId: "",
    location: "",
    status: "normal" as DeviceStatus,
    installDate: today,
    expireDate: today,
    checkCycle: "monthly" as CheckCycle,
    lastCheckDate: today,
    nextCheckDate: today,
    model: "",
    serialNumber: "",
    remark: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      if (isEdit && device) {
        setForm({
          code: device.code,
          name: device.name,
          type: device.type,
          buildingId: device.buildingId,
          location: device.location,
          status: device.status,
          installDate: device.installDate,
          expireDate: device.expireDate,
          checkCycle: device.checkCycle,
          lastCheckDate: device.lastCheckDate,
          nextCheckDate: device.nextCheckDate,
          model: device.model,
          serialNumber: device.serialNumber,
          remark: device.remark,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, isEdit, device]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.code || !form.name || !form.buildingId) return;
    onSave(form, isEdit, device?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Flame className="w-5 h-5 text-fire-600" />
            {isEdit ? "编辑设备" : "新增设备"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">设备编号 <span className="text-fire-500">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="如：MQ-A3-003"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="label">设备名称 <span className="text-fire-500">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="如：干粉灭火器"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">设备类型</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as DeviceType })}
              >
                {deviceTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">所属楼栋 <span className="text-fire-500">*</span></label>
              <select
                className="input"
                value={form.buildingId}
                onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
              >
                <option value="">请选择楼栋</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">安装位置</label>
              <input
                type="text"
                className="input"
                placeholder="如：3层走廊东"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <label className="label">状态</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DeviceStatus })}
              >
                {deviceStatusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">检查周期</label>
              <select
                className="input"
                value={form.checkCycle}
                onChange={(e) => setForm({ ...form, checkCycle: e.target.value as CheckCycle })}
              >
                {checkCycleOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">型号规格</label>
              <input
                type="text"
                className="input"
                placeholder="如：MFZ/ABC4"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div>
              <label className="label">序列号</label>
              <input
                type="text"
                className="input"
                placeholder="出厂序列号"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="label">安装日期</label>
              <input
                type="date"
                className="input"
                value={form.installDate}
                onChange={(e) => setForm({ ...form, installDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">有效期至</label>
              <input
                type="date"
                className="input"
                value={form.expireDate}
                onChange={(e) => setForm({ ...form, expireDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">上次检查日期</label>
              <input
                type="date"
                className="input"
                value={form.lastCheckDate}
                onChange={(e) => setForm({ ...form, lastCheckDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">下次检查日期</label>
              <input
                type="date"
                className="input"
                value={form.nextCheckDate}
                onChange={(e) => setForm({ ...form, nextCheckDate: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">备注</label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="其他需要说明的信息（可选）"
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="btn-outline">
            取消
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={!form.code || !form.name || !form.buildingId}
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  open,
  deviceName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  deviceName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-fire-50 border border-fire-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-fire-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                确认删除
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                确认删除设备「<span className="font-medium text-fire-600">{deviceName}</span>」？此操作不可撤销。
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="btn-outline">
            取消
          </button>
          <button onClick={onConfirm} className="btn-danger">
            <Trash2 className="w-4 h-4" />
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateMaintenanceModal({
  open,
  device,
  onClose,
  onSubmit,
}: {
  open: boolean;
  device: Device | null;
  onClose: () => void;
  onSubmit: (data: {
    deviceId: string;
    type: MaintenanceType;
    priority: "high" | "medium" | "low";
    description: string;
    handlerId: string;
    expectedDate: string;
  }) => void;
}) {
  const { users } = useAppStore();
  const engineers = useMemo(() => users.filter((u) => u.role === "engineer"), [users]);

  const defaultExpected = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const [form, setForm] = useState({
    type: "repair" as MaintenanceType,
    priority: "medium" as "high" | "medium" | "low",
    description: "",
    handlerId: "",
    expectedDate: defaultExpected,
  });

  useEffect(() => {
    if (open) {
      setForm({
        type: "repair",
        priority: device?.status === "expired" ? "high" : device?.status === "warning" ? "medium" : "low",
        description: device?.remark || "",
        handlerId: engineers[0]?.id || "",
        expectedDate: defaultExpected,
      });
    }
  }, [open, device, engineers, defaultExpected]);

  if (!open || !device) return null;

  const isValid = form.description.trim() && form.handlerId && form.expectedDate;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      deviceId: device.id,
      type: form.type,
      priority: form.priority,
      description: form.description.trim(),
      handlerId: form.handlerId,
      expectedDate: form.expectedDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-[560px] max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-warning-600" />
            发起维修/保养
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg border flex items-center justify-center shrink-0",
                deviceTypeBg[device.type]
              )}
            >
              {(() => {
                const Icon = deviceTypeIconCmp[device.type];
                return <Icon className="w-5 h-5" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800">
                {deviceTypeMap[device.type].icon} {device.name}
                <span className="ml-2">
                  <span className={cn("badge", deviceStatusMap[device.status].className)}>
                    {deviceStatusMap[device.status].label}
                  </span>
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {device.buildingName} · {device.location} · {device.code}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="label">维修类型 <span className="text-fire-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {(["repair", "maintenance"] as MaintenanceType[]).map((t) => (
                <label
                  key={t}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    form.type === t
                      ? t === "repair"
                        ? "border-warning-400 bg-warning-50 text-warning-700"
                        : "border-industrial-400 bg-industrial-50 text-industrial-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  <input
                    type="radio"
                    name="maintType"
                    value={t}
                    checked={form.type === t}
                    onChange={(e) => setForm({ ...form, type: e.target.value as MaintenanceType })}
                    className="sr-only"
                  />
                  <span className="text-lg">{maintenanceTypeMap[t].icon}</span>
                  <span className="font-medium">{maintenanceTypeMap[t].label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">优先级 <span className="text-fire-500">*</span></label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as "high" | "medium" | "low" })}
              className="input"
            >
              {priorityOptions.map((o) => (
                <option key={o.value} value={o.value} className={o.className}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">问题描述 / 保养内容 <span className="text-fire-500">*</span></label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="请详细描述设备故障情况或需要进行的保养内容..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">处理人 <span className="text-fire-500">*</span></label>
            <select
              value={form.handlerId}
              onChange={(e) => setForm({ ...form, handlerId: e.target.value })}
              className="input"
            >
              <option value="">请选择处理人（工程师）</option>
              {engineers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} - {u.dept}（{roleMap[u.role]}）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">预计完成日期 <span className="text-fire-500">*</span></label>
            <input
              type="date"
              className="input"
              value={form.expectedDate}
              onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="btn-outline">
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={!isValid}
          >
            <Save className="w-4 h-4" />
            提交维修单
          </button>
        </div>
      </div>
    </div>
  );
}

function MaintenanceDetailDrawer({
  open,
  order,
  onClose,
  onStart,
  onComplete,
}: {
  open: boolean;
  order: MaintenanceOrder | null;
  onClose: () => void;
  onStart: (id: string) => void;
  onComplete: (id: string, params: { processRecord: string; cost?: number; photoUrls?: string[] }) => void;
}) {
  const { devices, changeLogs } = useAppStore();
  const [activeTab, setActiveTab] = useState<"timeline" | "info" | "device">("timeline");
  const [processRecord, setProcessRecord] = useState("");
  const [cost, setCost] = useState<string>("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const device = order ? devices.find((d) => d.id === order.deviceId) : null;
  const deviceLogs = order
    ? changeLogs.filter((l) => l.recordId === order.deviceId && l.module === "设备台账").slice(0, 10)
    : [];

  useEffect(() => {
    if (order) {
      setActiveTab("timeline");
      setProcessRecord(order.processRecord || "");
      setCost(order.cost !== undefined ? String(order.cost) : "");
      setPhotoUrls(order.photoUrls || []);
    }
  }, [order]);

  if (!open || !order) return null;

  const timelineItems = useMemo(() => {
    const items: { time: string; title: string; operator: string; desc: string }[] = [];
    items.push({
      time: order.createTime,
      title: "维修单创建",
      operator: order.createdByName,
      desc: `发起${maintenanceTypeMap[order.type].label}单，问题：${order.description.slice(0, 50)}${order.description.length > 50 ? "..." : ""}`,
    });
    items.push({
      time: order.createTime,
      title: "指派处理人",
      operator: order.createdByName,
      desc: `指派给 ${order.handlerName}（${order.handlerDept}），预计完成日期 ${order.expectedDate}`,
    });
    if (order.startTime) {
      items.push({
        time: order.startTime,
        title: "开始处理",
        operator: order.handlerName,
        desc: `${order.handlerName} 已开始进行${maintenanceTypeMap[order.type].label}作业`,
      });
    }
    if (order.completeTime && order.processRecord) {
      items.push({
        time: order.completeTime,
        title: "处理完成",
        operator: order.handlerName,
        desc: order.processRecord.slice(0, 80) + (order.processRecord.length > 80 ? "..." : ""),
      });
    }
    return items;
  }, [order]);

  const canSubmitComplete = order.status === "in_progress" && processRecord.trim();

  const handlePhotoUpload = () => {
    const fakePhotos = [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=300&fit=crop",
    ];
    const newPhoto = fakePhotos[Math.floor(Math.random() * fakePhotos.length)] + `&t=${Date.now()}`;
    setPhotoUrls((prev) => [...prev, newPhoto].slice(0, 9));
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitComplete = () => {
    if (!canSubmitComplete) return;
    onComplete(order.id, {
      processRecord: processRecord.trim(),
      cost: cost ? parseFloat(cost) : undefined,
      photoUrls,
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl flex flex-col animate-slide-in-right"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-industrial-600" />
                维修单详情
              </h3>
              <span className={cn("badge", maintenanceStatusMap[order.status].className)}>
                {maintenanceStatusMap[order.status].label}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 font-mono">{order.id}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 bg-slate-50 px-6">
          {[
            { key: "timeline", label: "处理流程", icon: History },
            { key: "info", label: "维修信息", icon: FileText },
            { key: "device", label: "设备信息", icon: Info },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 -mb-px",
                activeTab === t.key
                  ? "border-industrial-500 text-industrial-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "timeline" && (
            <div className="p-6">
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
                {timelineItems.map((item, idx) => (
                  <div key={idx} className="relative mb-6 last:mb-0">
                    <div
                      className={cn(
                        "absolute -left-4 top-1 w-4 h-4 rounded-full border-2 bg-white",
                        idx === timelineItems.length - 1 && order.status !== "completed"
                          ? "border-industrial-500"
                          : idx === 0
                          ? "border-safe-500"
                          : "border-slate-300"
                      )}
                    >
                      {idx === timelineItems.length - 1 && order.status !== "completed" && (
                        <div className="absolute inset-0 rounded-full bg-industrial-500 animate-pulse opacity-50" />
                      )}
                    </div>
                    <div className="ml-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 text-sm">{item.title}</span>
                        {idx === 0 && (
                          <span className="badge badge-green">起点</span>
                        )}
                        {idx === timelineItems.length - 1 && order.status === "completed" && (
                          <span className="badge badge-green">完成</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {item.time}
                        <span className="mx-1">·</span>
                        <User className="w-3 h-3" />
                        {item.operator}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "info" && (
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-400 mb-1">类型</div>
                  <div className="flex items-center gap-1.5">
                    <span>{maintenanceTypeMap[order.type].icon}</span>
                    <span className="font-semibold text-slate-800">
                      {maintenanceTypeMap[order.type].label}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-400 mb-1">优先级</div>
                  <div>
                    <span className={cn("badge", priorityMap[order.priority].className)}>
                      {priorityMap[order.priority].label}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-400 mb-1">处理人</div>
                  <div className="font-semibold text-slate-800">{order.handlerName}</div>
                  <div className="text-xs text-slate-500">{order.handlerDept}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-400 mb-1">预计完成</div>
                  <div className="flex items-center gap-1">
                    <CalendarClock className="w-4 h-4 text-industrial-500" />
                    <span className="font-semibold text-slate-800">{order.expectedDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="label flex items-center gap-1">
                  <FileText className="w-4 h-4 text-slate-400" />
                  问题描述 / 保养内容
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-800 leading-relaxed">
                  {order.description}
                </div>
              </div>

              <div>
                <div className="label flex items-center gap-1">
                  <ClipboardList className="w-4 h-4 text-slate-400" />
                  处理记录
                  {order.status === "completed" && <span className="text-xs text-slate-400 font-normal">（只读）</span>}
                  {order.status === "pending" && <span className="text-xs text-slate-400 font-normal">（开始处理后可填写）</span>}
                </div>
                {order.status === "pending" ? (
                  <div className="p-6 rounded-lg bg-slate-50 border border-slate-100 border-dashed text-center text-sm text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    开始处理后可填写处理记录
                  </div>
                ) : (
                  <textarea
                    className={cn(
                      "input min-h-[120px] resize-none",
                      order.status === "completed" && "bg-slate-50 cursor-not-allowed"
                    )}
                    placeholder="请填写处理方法、更换零件、测试结果等详细信息..."
                    value={processRecord}
                    onChange={(e) => setProcessRecord(e.target.value)}
                    disabled={order.status === "completed"}
                  />
                )}
              </div>

              {order.status !== "pending" && (
                <div>
                  <div className="label flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    费用（元）
                    {order.status === "completed" && <span className="text-xs text-slate-400 font-normal">（只读）</span>}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={cn(
                      "input",
                      order.status === "completed" && "bg-slate-50 cursor-not-allowed"
                    )}
                    placeholder="请输入维修/保养费用（可选）"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    disabled={order.status === "completed"}
                  />
                </div>
              )}

              {order.status !== "pending" && (
                <div>
                  <div className="label flex items-center gap-1">
                    <Camera className="w-4 h-4 text-slate-400" />
                    照片记录（最多9张）
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {photoUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {order.status !== "completed" && (
                          <button
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-fire-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {order.status !== "completed" && photoUrls.length < 9 && (
                      <button
                        onClick={handlePhotoUpload}
                        className="aspect-square rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-industrial-400 hover:text-industrial-500 hover:bg-industrial-50 transition-all flex flex-col items-center justify-center gap-1"
                      >
                        <Camera className="w-6 h-6" />
                        <span className="text-xs">上传照片</span>
                      </button>
                    )}
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" />
                </div>
              )}
            </div>
          )}

          {activeTab === "device" && device && (
            <div className="p-6 space-y-5">
              <div className="card p-4">
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0",
                      deviceTypeBg[device.type]
                    )}
                  >
                    {(() => {
                      const Icon = deviceTypeIconCmp[device.type];
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {deviceTypeMap[device.type].icon} {device.name}
                      </span>
                      <span className={cn("badge", deviceStatusMap[device.status].className)}>
                        {deviceStatusMap[device.status].label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">{device.code}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-400 text-xs mb-0.5">所属楼栋</div>
                    <div className="text-slate-700">{device.buildingName}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-0.5">安装位置</div>
                    <div className="text-slate-700">{device.location}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-0.5">型号</div>
                    <div className="text-slate-700 font-mono">{device.model}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-0.5">序列号</div>
                    <div className="text-slate-700 font-mono">{device.serialNumber}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-0.5">安装日期</div>
                    <div className="text-slate-700">{device.installDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-0.5">有效期至</div>
                    <div className="text-slate-700">{device.expireDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-0.5">检查周期</div>
                    <div className="text-slate-700">{checkCycleMap[device.checkCycle]}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-0.5">下次检查</div>
                    <div className="text-slate-700">{device.nextCheckDate}</div>
                  </div>
                </div>
                {device.remark && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-slate-400 text-xs mb-1">备注</div>
                    <div className="text-sm text-slate-600">{device.remark}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="section-title mb-3">
                  <History className="w-5 h-5 text-industrial-500" />
                  设备变更历史
                </div>
                {deviceLogs.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400 bg-slate-50 rounded-lg">
                    暂无变更记录
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deviceLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">{log.operateTime}</span>
                          <span className={cn(
                            "badge",
                            log.action === "create" ? "badge-green" : log.action === "update" ? "badge-blue" : "badge-red"
                          )}>
                            {log.action === "create" ? "新增" : log.action === "update" ? "修改" : "删除"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700">
                          {log.fieldName && (
                            <>
                              <span className="text-slate-500">{log.fieldName}：</span>
                              {log.oldValue && (
                                <span className="text-slate-400 line-through mr-1">{log.oldValue}</span>
                              )}
                              <ChevronRight className="w-3 h-3 inline mx-0.5 text-slate-400" />
                              <span className="font-medium">{log.newValue}</span>
                            </>
                          )}
                          {!log.fieldName && <span>操作记录</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">操作人：{log.operatorName}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {(order.status === "pending" || order.status === "in_progress") && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            {order.status === "pending" && (
              <button onClick={() => onStart(order.id)} className="btn-primary">
                <CheckCircle2 className="w-4 h-4" />
                🚀 我已开始处理
              </button>
            )}
            {order.status === "in_progress" && (
              <button
                onClick={handleSubmitComplete}
                className="btn-primary"
                disabled={!canSubmitComplete}
              >
                <CheckCircle2 className="w-4 h-4" />
                ✅ 提交完成处理
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MaintenanceListView({
  filterTab,
  onSetFilterTab,
  onViewDetail,
  isEngineer,
  currentUserId,
  currentUserName,
}: {
  filterTab: MaintTabType;
  onSetFilterTab: (t: MaintTabType) => void;
  onViewDetail: (id: string) => void;
  isEngineer?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}) {
  const { maintenanceOrders, users } = useAppStore();

  const filtered = useMemo(() => {
    let result = maintenanceOrders;
    if (isEngineer && currentUserId) {
      result = result.filter((o) => o.handlerId === currentUserId);
    }
    if (filterTab === "all") return result;
    return result.filter((o) => o.status === filterTab);
  }, [maintenanceOrders, filterTab, isEngineer, currentUserId]);

  const getHandler = (id: string) => users.find((u) => u.id === id);

  const visibleOrders = useMemo(() => {
    if (isEngineer && currentUserId) {
      return maintenanceOrders.filter((o) => o.handlerId === currentUserId);
    }
    return maintenanceOrders;
  }, [maintenanceOrders, isEngineer, currentUserId]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-1 border-b border-slate-100 px-6 flex-wrap">
        {maintTabs.map((t) => {
          const count =
            t.value === "all"
              ? visibleOrders.length
              : visibleOrders.filter((o) => o.status === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => onSetFilterTab(t.value)}
              className={cn(
                "tab-underline px-4 py-4 text-sm font-medium transition-colors flex items-center gap-1.5",
                filterTab === t.value
                  ? "tab-underline-active text-industrial-600"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  filterTab === t.value
                    ? "bg-industrial-50 text-industrial-600"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">工单号</th>
              <th className="table-th">设备信息</th>
              <th className="table-th">类型</th>
              <th className="table-th">优先级</th>
              <th className="table-th">处理人</th>
              <th className="table-th">状态</th>
              <th className="table-th">预计完成</th>
              <th className="table-th text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-td text-center py-12 text-slate-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  暂无{maintTabs.find((t) => t.value === filterTab)?.label}维修单
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const handler = getHandler(o.handlerId);
                const daysLeft = daysUntil(o.expectedDate);
                return (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td">
                      <div className="font-mono text-xs font-semibold text-slate-700">{o.id}</div>
                      <div className="text-xs text-slate-400">{o.createTime}</div>
                    </td>
                    <td className="table-td">
                      <div className="font-medium text-slate-800 text-sm">
                        {deviceTypeMap[o.deviceId.startsWith("d") ? "fire_extinguisher" : "sprinkler"]?.icon || "🔧"} {o.deviceName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {o.buildingName} · <span className="font-mono">{o.deviceCode}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={cn("badge", maintenanceTypeMap[o.type].className)}>
                        {maintenanceTypeMap[o.type].icon} {maintenanceTypeMap[o.type].label}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={cn("badge", priorityMap[o.priority].className)}>
                        {priorityMap[o.priority].label}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="text-sm text-slate-700">{o.handlerName}</div>
                      <div className="text-xs text-slate-400">{o.handlerDept}</div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", maintenanceStatusMap[o.status].dotColor)} />
                        <span className={cn("badge", maintenanceStatusMap[o.status].className)}>
                          {maintenanceStatusMap[o.status].label}
                        </span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="text-sm text-slate-700 flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                        {o.expectedDate}
                      </div>
                      {o.status !== "completed" && (
                        <div
                          className={cn(
                            "text-xs mt-0.5",
                            daysLeft < 0
                              ? "text-fire-600 font-medium"
                              : daysLeft <= 3
                              ? "text-warning-600"
                              : "text-slate-400"
                          )}
                        >
                          {daysLeft < 0
                            ? `已逾期${Math.abs(daysLeft)}天`
                            : daysLeft === 0
                            ? "今日到期"
                            : `剩余${daysLeft}天`}
                        </div>
                      )}
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={() => onViewDetail(o.id)}
                        className="btn-outline !px-3 !py-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DeviceList() {
  const {
    devices,
    addDevice,
    updateDevice,
    deleteDevice,
    maintenanceOrders,
    createMaintenanceOrder,
    startMaintenance,
    completeMaintenance,
    getDeviceMaintenanceOrders,
    users,
    currentUser,
    currentUserId,
  } = useAppStore();

  const role = currentUser.role;
  const isEngineer = role === "engineer";
  const isAdmin = ["director", "manager", "admin"].includes(role);

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [maintFilterTab, setMaintFilterTab] = useState<MaintTabType>("all");
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [createMaintOpen, setCreateMaintOpen] = useState(false);
  const [createMaintDevice, setCreateMaintDevice] = useState<Device | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<MaintenanceOrder | null>(null);

  const showToast = (msg: string) => setToast(msg);

  const myDeviceIds = useMemo(() => {
    if (!isEngineer) return null;
    const ids = new Set<string>();
    maintenanceOrders
      .filter((o) => o.handlerId === currentUserId)
      .forEach((o) => ids.add(o.deviceId));
    return ids;
  }, [maintenanceOrders, currentUserId, isEngineer]);

  const filteredDevices = useMemo(() => {
    let result = devices;
    if (isEngineer && myDeviceIds) {
      result = result.filter((d) => myDeviceIds.has(d.id));
    }
    if (activeTab === "all") return result;
    if (activeTab === "maintenance") return result;
    return result.filter((d) => d.type === activeTab);
  }, [devices, activeTab, isEngineer, myDeviceIds]);

  const visibleMaintCount = useMemo(() => {
    if (!isEngineer) return maintenanceOrders.length;
    return maintenanceOrders.filter((o) => o.handlerId === currentUserId).length;
  }, [maintenanceOrders, currentUserId, isEngineer]);

  const deletingDevice = devices.find((d) => d.id === deletingId) || null;

  const handleOpenAdd = () => {
    setEditingDevice(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (d: Device) => {
    setEditingDevice(d);
    setFormOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleSaveDevice = (
    data: Omit<Device, "id" | "buildingName"> & { buildingId: string },
    isEdit: boolean,
    id?: string
  ) => {
    if (isEdit && id) {
      updateDevice(id, data);
    } else {
      addDevice(data);
    }
    setFormOpen(false);
    setEditingDevice(null);
    showToast("保存成功");
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteDevice(deletingId);
      setDeleteOpen(false);
      setDeletingId(null);
      showToast("删除成功");
    }
  };

  const handleCreateMaint = (device: Device) => {
    setCreateMaintDevice(device);
    setCreateMaintOpen(true);
  };

  const handleSubmitCreateMaint = (data: {
    deviceId: string;
    type: MaintenanceType;
    priority: "high" | "medium" | "low";
    description: string;
    handlerId: string;
    expectedDate: string;
  }) => {
    const result = createMaintenanceOrder(data);
    const handler = users.find((u) => u.id === data.handlerId);
    setCreateMaintOpen(false);
    setCreateMaintDevice(null);
    if (result && handler) {
      showToast(`维修单创建成功，已指派给 ${handler.name}`);
    }
  };

  const handleViewMaint = (moId: string) => {
    const order = maintenanceOrders.find((o) => o.id === moId);
    if (order) {
      setDetailOrder(order);
      setDetailDrawerOpen(true);
    }
  };

  const handleViewHistory = (deviceId: string) => {
    const orders = getDeviceMaintenanceOrders(deviceId);
    if (orders.length > 0) {
      setDetailOrder(orders[0]);
      setDetailDrawerOpen(true);
    } else {
      showToast("暂无保养记录");
    }
  };

  const handleStartMaint = (id: string) => {
    startMaintenance(id);
    const updated = maintenanceOrders.find((o) => o.id === id);
    if (updated) setDetailOrder({ ...updated, status: "in_progress", startTime: new Date().toISOString().slice(0, 16).replace("T", " ") });
    showToast("已开始处理");
  };

  const handleCompleteMaint = (
    id: string,
    params: { processRecord: string; cost?: number; photoUrls?: string[] }
  ) => {
    completeMaintenance(id, params);
    setDetailDrawerOpen(false);
    setDetailOrder(null);
    showToast("维修完成，设备已恢复正常状态");
  };

  return (
    <div className="p-6 space-y-4">
      <div
        className={cn(
          "card px-5 py-3.5 flex items-center gap-3",
          isEngineer
            ? "bg-gradient-to-r from-warning-50 to-industrial-50 border-warning-200"
            : "bg-gradient-to-r from-industrial-50 to-slate-50 border-industrial-200"
        )}
      >
        <div className="text-2xl">
          {isEngineer ? "🔧" : "📊"}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {isEngineer
              ? `仅显示与您维修相关的设备（共 ${filteredDevices.length} 台 / ${visibleMaintCount} 条维修单）`
              : `显示全部设备（共 ${devices.length} 台 / ${maintenanceOrders.length} 条维修单）`}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEngineer
              ? `当前登录：${currentUser.name} · 工程维修 · 负责处理设备维修保养单`
              : `角色：${roleMap[currentUser.role] || currentUser.role}，可管理所有设备和维修单`}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-1 -mb-px flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={cn(
                  "tab-underline px-4 py-4 text-sm font-medium transition-colors flex items-center gap-1.5",
                  activeTab === t.value
                    ? "tab-underline-active text-industrial-600"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t.icon && <span>{t.icon}</span>}
                {t.label}
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeTab === t.value
                      ? "bg-industrial-50 text-industrial-600"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {t.value === "all"
                    ? filteredDevices.length
                    : t.value === "maintenance"
                    ? visibleMaintCount
                    : (isEngineer && myDeviceIds
                        ? devices.filter((d) => d.type === t.value && myDeviceIds.has(d.id)).length
                        : devices.filter((d) => d.type === t.value).length)}
                </span>
              </button>
            ))}
          </div>

          {activeTab !== "maintenance" && isAdmin && (
            <div className="flex items-center gap-2 py-3">
              <button
                onClick={() => setCycleModalOpen(true)}
                className="btn-outline"
              >
                <Settings className="w-4 h-4" />
                检查周期配置
              </button>
              <button className="btn-primary" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4" />
                新增设备
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === "maintenance" ? (
        <MaintenanceListView
          filterTab={maintFilterTab}
          onSetFilterTab={setMaintFilterTab}
          onViewDetail={handleViewMaint}
          isEngineer={isEngineer}
          currentUserId={currentUserId}
          currentUserName={currentUser.name}
        />
      ) : filteredDevices.length === 0 ? (
        <div className="card py-20 text-center text-slate-400 text-sm">
          暂无匹配的设备数据
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map((d) => (
            <DeviceCard
              key={d.id}
              device={d}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onCreateMaint={handleCreateMaint}
              onViewMaint={handleViewMaint}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      <CheckCycleModal
        open={cycleModalOpen}
        onClose={() => setCycleModalOpen(false)}
      />

      <DeviceFormModal
        open={formOpen}
        device={editingDevice}
        onClose={() => {
          setFormOpen(false);
          setEditingDevice(null);
        }}
        onSave={handleSaveDevice}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        deviceName={deletingDevice?.name || ""}
        onClose={() => {
          setDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <CreateMaintenanceModal
        open={createMaintOpen}
        device={createMaintDevice}
        onClose={() => {
          setCreateMaintOpen(false);
          setCreateMaintDevice(null);
        }}
        onSubmit={handleSubmitCreateMaint}
      />

      <MaintenanceDetailDrawer
        open={detailDrawerOpen}
        order={detailOrder}
        onClose={() => {
          setDetailDrawerOpen(false);
          setDetailOrder(null);
        }}
        onStart={handleStartMaint}
        onComplete={handleCompleteMaint}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}