export type RiskLevel = "high" | "medium" | "low" | "normal";
export type DeviceType = "fire_extinguisher" | "sprinkler" | "fire_hydrant" | "smoke_detector" | "fire_alarm";
export type DeviceStatus = "normal" | "warning" | "expired" | "maintenance";
export type CheckCycle = "monthly" | "quarterly" | "half_year" | "yearly";
export type InspectionStatus = "pending" | "in_progress" | "completed" | "overdue";
export type InspectionType = "daily" | "weekly" | "monthly" | "special";
export type HazardLevel = "major" | "larger" | "general";
export type HazardStatus = "pending" | "rectifying" | "reviewing" | "closed";
export type DrillType = "fire" | "evacuation" | "comprehensive";
export type DrillStatus = "planned" | "ongoing" | "completed";
export type UserRole = "director" | "manager" | "inspector" | "rectifier";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PagedParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PagedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
