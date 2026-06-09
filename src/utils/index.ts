import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dateStr: string): boolean {
  return daysUntil(dateStr) < 0;
}

export const riskLevelMap: Record<string, { label: string; className: string; dotColor: string }> = {
  high: { label: "高风险", className: "badge-red", dotColor: "bg-fire-600" },
  medium: { label: "中风险", className: "badge-orange", dotColor: "bg-warning-500" },
  low: { label: "低风险", className: "badge-yellow", dotColor: "bg-risk-500" },
  normal: { label: "正常", className: "badge-green", dotColor: "bg-safe-500" },
};

export const buildingTypeMap: Record<string, string> = {
  office: "办公楼",
  rnd: "研发楼",
  workshop: "生产车间",
  warehouse: "仓储中心",
  complex: "综合楼",
  other: "其他",
};

export const deviceTypeMap: Record<string, { label: string; icon: string }> = {
  fire_extinguisher: { label: "灭火器", icon: "🧯" },
  sprinkler: { label: "喷淋系统", icon: "💧" },
  fire_hydrant: { label: "消防栓", icon: "🚰" },
  smoke_detector: { label: "烟感探测器", icon: "📡" },
  fire_alarm: { label: "报警主机", icon: "🔔" },
  emergency_light: { label: "应急照明", icon: "💡" },
};

export const deviceStatusMap: Record<string, { label: string; className: string }> = {
  normal: { label: "正常", className: "badge-green" },
  warning: { label: "预警", className: "badge-yellow" },
  expired: { label: "过期", className: "badge-red" },
  maintenance: { label: "维修中", className: "badge-blue" },
};

export const checkCycleMap: Record<string, string> = {
  daily: "每日",
  weekly: "每周",
  monthly: "每月",
  quarterly: "每季度",
  half_year: "每半年",
  yearly: "每年",
};

export const inspectionStatusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "待执行", className: "badge-gray" },
  in_progress: { label: "进行中", className: "badge-blue" },
  completed: { label: "已完成", className: "badge-green" },
  overdue: { label: "已逾期", className: "badge-red" },
};

export const inspectionPointStatusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "待巡检", className: "badge-gray" },
  done: { label: "已完成", className: "badge-green" },
};

export const inspectionTypeMap: Record<string, string> = {
  daily: "日常巡检",
  weekly: "周度检查",
  monthly: "月度巡检",
  special: "专项排查",
};

export const hazardLevelMap: Record<string, { label: string; className: string; rank: number }> = {
  major: { label: "重大隐患", className: "badge-red", rank: 3 },
  larger: { label: "较大隐患", className: "badge-orange", rank: 2 },
  general: { label: "一般隐患", className: "badge-yellow", rank: 1 },
};

export const hazardStatusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "待整改", className: "badge-red" },
  rectifying: { label: "整改中", className: "badge-orange" },
  reviewing: { label: "待复查", className: "badge-blue" },
  closed: { label: "已关闭", className: "badge-green" },
};

export const drillTypeMap: Record<string, string> = {
  fire: "灭火演练",
  evacuation: "疏散演练",
  comprehensive: "综合演练",
};

export const drillStatusMap: Record<string, { label: string; className: string }> = {
  planned: { label: "计划中", className: "badge-gray" },
  ongoing: { label: "进行中", className: "badge-blue" },
  completed: { label: "已完成", className: "badge-green" },
};

export const roleMap: Record<string, string> = {
  director: "安全主管",
  manager: "物业管理员",
  inspector: "巡检员",
  rectifier: "整改责任人",
  engineer: "工程师",
};

export const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: "高", color: "bg-fire-500" },
  medium: { label: "中", color: "bg-warning-500" },
  low: { label: "低", color: "bg-safe-500" },
};

export function genId(prefix = ""): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
