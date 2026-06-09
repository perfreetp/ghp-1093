import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { useAppStore } from "@/store";
import {
  cn,
  deviceTypeMap,
  deviceStatusMap,
  checkCycleMap,
  daysUntil,
  isOverdue,
} from "@/utils";
import type { Device, DeviceType, CheckCycle, DeviceStatus } from "@/types";

type TabType = "all" | DeviceType;

const tabs: { value: TabType; label: string; icon: string }[] = [
  { value: "all", label: "全部", icon: "" },
  { value: "fire_extinguisher", label: "灭火器", icon: "🧯" },
  { value: "sprinkler", label: "喷淋", icon: "💧" },
  { value: "fire_hydrant", label: "消防栓", icon: "🚰" },
  { value: "smoke_detector", label: "烟感", icon: "📡" },
  { value: "fire_alarm", label: "报警", icon: "🔔" },
  { value: "emergency_light", label: "应急照明", icon: "💡" },
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

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
      <div className="bg-safe-600 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
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
}: {
  device: Device;
  onEdit: (d: Device) => void;
  onDelete: (id: string) => void;
}) {
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

  return (
    <div className="card p-5 relative group overflow-hidden">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
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

export default function DeviceList() {
  const { devices, addDevice, updateDevice, deleteDevice } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => setToast(msg);

  const filteredDevices = useMemo(() => {
    if (activeTab === "all") return devices;
    return devices.filter((d) => d.type === activeTab);
  }, [devices, activeTab]);

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

  return (
    <div className="p-6 space-y-4">
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
                    ? devices.length
                    : devices.filter((d) => d.type === t.value).length}
                </span>
              </button>
            ))}
          </div>

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
        </div>
      </div>

      {filteredDevices.length === 0 ? (
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
