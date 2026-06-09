export type RiskLevel = "high" | "medium" | "low" | "normal";

export type BuildingType = "office" | "rnd" | "workshop" | "warehouse" | "complex" | "other";

export type DeviceType = "fire_extinguisher" | "sprinkler" | "fire_hydrant" | "smoke_detector" | "fire_alarm" | "emergency_light";

export type DeviceStatus = "normal" | "warning" | "expired" | "maintenance";

export type CheckCycle = "daily" | "weekly" | "monthly" | "quarterly" | "half_year" | "yearly";

export type InspectionStatus = "pending" | "in_progress" | "completed" | "overdue";

export type InspectionPointStatus = "pending" | "done";

export type InspectionType = "daily" | "weekly" | "monthly" | "special";

export type HazardLevel = "major" | "larger" | "general";

export type HazardStatus = "pending" | "rectifying" | "reviewing" | "closed";

export type DrillType = "fire" | "evacuation" | "comprehensive";

export type DrillStatus = "planned" | "ongoing" | "completed";

export interface DrillScores {
  organization: number;
  participation: number;
  effect: number;
  organizationRemark?: string;
  participationRemark?: string;
  effectRemark?: string;
}

export type UserRole = "director" | "manager" | "inspector" | "rectifier" | "engineer";

export interface Building {
  id: string;
  code: string;
  name: string;
  address: string;
  floors: number;
  area: number;
  buildingType: BuildingType;
  riskLevel: RiskLevel;
  buildYear: number;
  fireFacilitiesDesc: string;
  fireFacilities: string[];
  lastInspection: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  code: string;
  name: string;
  buildingId: string;
  buildingName: string;
  location: string;
  type: DeviceType;
  model: string;
  serialNumber: string;
  installDate: string;
  expireDate: string;
  lastCheckDate: string;
  nextCheckDate: string;
  checkCycle: CheckCycle;
  status: DeviceStatus;
  pressureLevel?: "normal" | "low" | "high";
  remark: string;
}

export interface InspectionPoint {
  id: string;
  buildingId: string;
  buildingName: string;
  location: string;
  qrCode: string;
  items: string[];
  lastInspectDate?: string;
  inspected?: boolean;
  status?: InspectionPointStatus;
  checkedItems?: string[];
  photoUrls?: string[];
  notes?: string;
  savedAt?: string;
}

export interface Inspection {
  id: string;
  title: string;
  type: InspectionType;
  status: InspectionStatus;
  inspectorId: string;
  inspectorName: string;
  buildingIds: string[];
  pointIds: string[];
  startDate: string;
  endDate: string;
  completeDate?: string;
  progress: number;
  createdAt: string;
  creatorName: string;
}

export interface InspectionRecord {
  id: string;
  inspectionId: string;
  pointId: string;
  inspectorId: string;
  scanTime: string;
  photos: string[];
  remark?: string;
  items: { name: string; result: "pass" | "fail" | "na"; remark?: string }[];
  hasHazard: boolean;
}

export interface StatusHistoryItem {
  time: string;
  fromStatus: HazardStatus | "";
  toStatus: HazardStatus;
  operator: string;
  description: string;
}

export interface Hazard {
  id: string;
  title: string;
  description: string;
  level: HazardLevel;
  status: HazardStatus;
  buildingId: string;
  buildingName: string;
  location: string;
  photos: string[];
  reporterId: string;
  reporterName: string;
  reportTime: string;
  responsibleId: string;
  responsibleName: string;
  responsibleDept: string;
  deadline: string;
  rectifyMeasures?: string;
  rectifyDate?: string;
  rectifyPhotos?: string[];
  reviewerId?: string;
  reviewerName?: string;
  reviewDate?: string;
  reviewResult?: "pass" | "fail";
  reviewRemark?: string;
  reviewNotes?: string;
  history: { status: string; time: string; operator: string; remark?: string }[];
  statusHistory: StatusHistoryItem[];
}

export interface Drill {
  id: string;
  title: string;
  type: DrillType;
  status: DrillStatus;
  date: string;
  location: string;
  duration: number;
  participants: number;
  signedCount: number;
  photos: string[];
  evaluation: string;
  organizer: string;
  createdAt: string;
  scores?: DrillScores;
  comment?: string;
  photoUrls?: string[];
  endTime?: string;
}

export interface DrillAttendee {
  id: string;
  drillId: string;
  userId: string;
  userName: string;
  dept: string;
  signTime: string;
}

export interface ChangeLog {
  id: string;
  module: string;
  recordId: string;
  recordName: string;
  action: "create" | "update" | "delete";
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  operatorId: string;
  operatorName: string;
  operateTime: string;
}

export interface OverdueStats {
  dept: string;
  inspectionOverdue: number;
  hazardOverdue: number;
  deviceExpired: number;
}

export interface MonthlyReport {
  month: string;
  inspectionTotal: number;
  inspectionCompleted: number;
  hazardTotal: number;
  hazardClosed: number;
  drillCount: number;
  deviceCheckCount: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  dept: string;
  phone: string;
  email: string;
  avatar: string;
}

export interface OverviewStats {
  buildingCount: number;
  deviceCount: number;
  inspectionRate: number;
  pendingHazards: number;
  highRiskBuildings: number;
  pendingInspections: number;
  pendingReviews: number;
  overdueHazards: number;
}

export interface TodoItem {
  id: string;
  type: "inspection" | "hazard" | "review";
  title: string;
  priority: "high" | "medium" | "low";
  deadline: string;
  relatedId: string;
  relatedName: string;
}

export interface AlertItem {
  id: string;
  type: "device_expire" | "hazard_overdue" | "inspection_miss";
  title: string;
  description: string;
  level: "danger" | "warning" | "info";
  time: string;
}
