import { create } from "zustand";
import type {
  Building,
  Device,
  Inspection,
  InspectionPoint,
  Hazard,
  Drill,
  DrillAttendee,
  ChangeLog,
  User,
  OverdueStats,
  MonthlyReport,
  OverviewStats,
  TodoItem,
  AlertItem,
  InspectionRecord,
  InspectionPointStatus,
  DrillScores,
  MaintenanceOrder,
} from "@/types";
import {
  mockBuildings,
  mockDevices,
  mockInspections,
  mockInspectionPoints,
  mockHazards,
  mockDrills,
  mockDrillAttendees,
  mockChangeLogs,
  mockUsers,
  mockOverdueStats,
  mockMonthlyReports,
  mockOverviewStats,
  mockTodos,
  mockAlerts,
  mockMaintenanceOrders,
} from "@/data/mockData";

const STORAGE_KEY = "fire-inspection-v1";

const PERSIST_FIELDS = [
  "buildings",
  "devices",
  "inspections",
  "inspectionPoints",
  "inspectionRecords",
  "hazards",
  "drills",
  "drillAttendees",
  "changeLogs",
  "users",
  "overdueStats",
  "monthlyReports",
  "overviewStats",
  "todos",
  "alerts",
  "currentUserId",
  "maintenanceOrders",
] as const;

type PersistState = Pick<AppState, (typeof PERSIST_FIELDS)[number]>;

function getInitialState(): PersistState {
  const defaults: PersistState = {
    buildings: mockBuildings,
    devices: mockDevices,
    inspections: mockInspections,
    inspectionPoints: mockInspectionPoints,
    inspectionRecords: [],
    hazards: mockHazards,
    drills: mockDrills,
    drillAttendees: mockDrillAttendees,
    changeLogs: mockChangeLogs,
    users: mockUsers,
    overdueStats: mockOverdueStats,
    monthlyReports: mockMonthlyReports,
    overviewStats: mockOverviewStats,
    todos: mockTodos,
    alerts: mockAlerts,
    currentUserId: "u1",
    maintenanceOrders: mockMaintenanceOrders,
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaults;
    const parsed = JSON.parse(saved) as Partial<PersistState>;
    const merged: PersistState = { ...defaults };
    for (const key of PERSIST_FIELDS) {
      if (parsed[key] !== undefined && parsed[key] !== null) {
        (merged as any)[key] = parsed[key];
      }
    }
    return merged;
  } catch (e) {
    console.error("[store] Failed to parse persisted state, falling back to defaults:", e);
    return defaults;
  }
}

interface AppState {
  buildings: Building[];
  devices: Device[];
  inspections: Inspection[];
  inspectionPoints: InspectionPoint[];
  inspectionRecords: InspectionRecord[];
  hazards: Hazard[];
  drills: Drill[];
  drillAttendees: DrillAttendee[];
  changeLogs: ChangeLog[];
  users: User[];
  overdueStats: OverdueStats[];
  monthlyReports: MonthlyReport[];
  overviewStats: OverviewStats;
  todos: TodoItem[];
  alerts: AlertItem[];
  maintenanceOrders: MaintenanceOrder[];
  currentUserId: string;
  currentUser: User;
  sidebarCollapsed: boolean;
  selectedBuildingId: string | null;
  selectedHazardId: string | null;
  selectedInspectionId: string | null;
  selectedDrillId: string | null;

  toggleSidebar: () => void;
  setSelectedBuildingId: (id: string | null) => void;
  setSelectedHazardId: (id: string | null) => void;
  setSelectedInspectionId: (id: string | null) => void;
  setSelectedDrillId: (id: string | null) => void;
  setCurrentUser: (userId: string) => void;

  getUserById: (id: string) => User | undefined;
  getCurrentRole: () => User["role"] | undefined;
  getAssignableUsers: () => User[];

  addBuilding: (b: Omit<Building, "id" | "createdAt" | "updatedAt"> & { code: string; name: string }) => void;
  updateBuilding: (id: string, data: Partial<Building>) => void;
  deleteBuilding: (id: string) => void;

  addDevice: (d: Omit<Device, "id" | "buildingName"> & { buildingId: string }) => void;
  updateDevice: (id: string, data: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  updateDeviceCheckCycle: (type: string, cycle: string) => void;

  addInspection: (i: Inspection) => void;
  updateInspection: (id: string, data: Partial<Inspection>) => void;
  addInspectionRecord: (r: InspectionRecord) => void;
  saveInspectionPoint: (
    inspectionId: string,
    pointId: string,
    data: {
      status: InspectionPointStatus;
      checkedItems: string[];
      photoUrls: string[];
      photoFilenames?: string[];
      notes: string;
    }
  ) => { success: boolean; error?: string };
  alignInspectionProgress: (inspectionId: string) => number;

  addHazard: (h: Hazard) => void;
  updateHazard: (id: string, data: Partial<Hazard>) => void;
  assignHazard: (id: string, params: { responsibleId: string; responsibleName: string; responsibleDept: string; deadline: string; remark?: string }) => void;
  submitHazardRectify: (id: string, params: { rectifyMeasures: string; rectifyPhotos?: string[] }) => void;
  reviewHazard: (id: string, params: { reviewRemark: string }) => void;
  revertHazard: (id: string, params: { reviewRemark: string }) => void;

  addDrill: (d: Drill) => void;
  updateDrill: (id: string, data: Partial<Drill>) => void;
  setDrillPhotos: (id: string, photoUrls: string[]) => void;
  addDrillAttendee: (a: DrillAttendee) => void;
  updateDrillScores: (id: string, scores: DrillScores) => void;
  updateDrillComment: (id: string, comment: string) => void;
  addDrillPhoto: (id: string, photoUrl: string) => void;
  deleteDrillPhoto: (id: string, index: number) => void;
  completeDrill: (id: string) => void;

  createMaintenanceOrder: (data: {
    deviceId: string;
    type: "repair" | "maintenance";
    priority: "high" | "medium" | "low";
    description: string;
    handlerId: string;
    expectedDate: string;
  }) => MaintenanceOrder | null;
  startMaintenance: (id: string) => void;
  completeMaintenance: (
    id: string,
    params: { processRecord: string; cost?: number; photoUrls?: string[] }
  ) => void;
  getDeviceMaintenanceOrders: (deviceId: string) => MaintenanceOrder[];

  addChangeLog: (log: Partial<ChangeLog> & { module: string; recordName: string; action: "create" | "update" | "delete"; operatorName: string; fieldName?: string; oldValue?: string; newValue?: string }) => void;

  resetStore: () => void;
}

const initialPersisted = getInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialPersisted,
  currentUserId: initialPersisted.currentUserId || "u1",
  currentUser:
    initialPersisted.users.find((u) => u.id === (initialPersisted.currentUserId || "u1")) ??
    initialPersisted.users[0] ??
    mockUsers[0],
  sidebarCollapsed: false,
  selectedBuildingId: null,
  selectedHazardId: null,
  selectedInspectionId: null,
  selectedDrillId: null,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSelectedBuildingId: (id) => set({ selectedBuildingId: id }),
  setSelectedHazardId: (id) => set({ selectedHazardId: id }),
  setSelectedInspectionId: (id) => set({ selectedInspectionId: id }),
  setSelectedDrillId: (id) => set({ selectedDrillId: id }),

  setCurrentUser: (userId) => {
    const { users } = get();
    const user = users.find((u) => u.id === userId);
    if (user) {
      set({ currentUserId: userId, currentUser: user });
    }
  },

  getUserById: (id) => get().users.find((u) => u.id === id),
  getCurrentRole: () => {
    const { currentUserId, users } = get();
    return users.find((u) => u.id === currentUserId)?.role;
  },
  getAssignableUsers: () =>
    get().users.filter((u) => ["inspector", "engineer"].includes(u.role)),

  addBuilding: (b) => {
    const { currentUser, addChangeLog } = get();
    const now = new Date().toISOString().slice(0, 10);
    const newBuilding: Building = {
      id: `b${Date.now()}`,
      ...b,
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ buildings: [newBuilding, ...s.buildings] }));
    addChangeLog({
      module: "建筑档案",
      recordId: newBuilding.id,
      recordName: newBuilding.name,
      action: "create",
      operatorName: currentUser.name,
    });
  },
  updateBuilding: (id, data) => {
    const { currentUser, addChangeLog, buildings } = get();
    const oldBuilding = buildings.find((b) => b.id === id);
    if (!oldBuilding) return;
    set((s) => ({
      buildings: s.buildings.map((b) => (b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : b)),
    }));
    const fieldNames = Object.keys(data);
    addChangeLog({
      module: "建筑档案",
      recordId: id,
      recordName: oldBuilding.name,
      action: "update",
      fieldName: fieldNames.length > 0 ? fieldNames.join("、") : undefined,
      operatorName: currentUser.name,
    });
  },
  deleteBuilding: (id) => {
    const { currentUser, addChangeLog, buildings } = get();
    const oldBuilding = buildings.find((b) => b.id === id);
    if (!oldBuilding) return;
    set((s) => ({ buildings: s.buildings.filter((b) => b.id !== id) }));
    addChangeLog({
      module: "建筑档案",
      recordId: id,
      recordName: oldBuilding.name,
      action: "delete",
      operatorName: currentUser.name,
    });
  },

  addDevice: (d) => {
    const { currentUser, addChangeLog, buildings } = get();
    const building = buildings.find((b) => b.id === d.buildingId);
    const newDevice: Device = {
      id: `d${Date.now()}`,
      buildingName: building?.name || "",
      ...d,
    } as Device;
    set((s) => ({ devices: [newDevice, ...s.devices] }));
    addChangeLog({
      module: "设备台账",
      recordId: newDevice.id,
      recordName: newDevice.name,
      action: "create",
      operatorName: currentUser.name,
    });
  },
  updateDevice: (id, data) => {
    const { currentUser, addChangeLog, devices, buildings } = get();
    const oldDevice = devices.find((d) => d.id === id);
    if (!oldDevice) return;
    let newBuildingName = oldDevice.buildingName;
    if (data.buildingId && data.buildingId !== oldDevice.buildingId) {
      const building = buildings.find((b) => b.id === data.buildingId);
      if (building) newBuildingName = building.name;
    }
    set((s) => ({
      devices: s.devices.map((d) =>
        d.id === id ? { ...d, ...data, buildingName: data.buildingId ? newBuildingName : d.buildingName } : d
      ),
    }));
    const fieldNames = Object.keys(data);
    addChangeLog({
      module: "设备台账",
      recordId: id,
      recordName: oldDevice.name,
      action: "update",
      fieldName: fieldNames.length > 0 ? fieldNames.join("、") : undefined,
      operatorName: currentUser.name,
    });
  },
  deleteDevice: (id) => {
    const { currentUser, addChangeLog, devices } = get();
    const oldDevice = devices.find((d) => d.id === id);
    if (!oldDevice) return;
    set((s) => ({ devices: s.devices.filter((d) => d.id !== id) }));
    addChangeLog({
      module: "设备台账",
      recordId: id,
      recordName: oldDevice.name,
      action: "delete",
      operatorName: currentUser.name,
    });
  },
  updateDeviceCheckCycle: (type, cycle) =>
    set((s) => ({
      devices: s.devices.map((d) => (d.type === type ? { ...d, checkCycle: cycle as Device["checkCycle"] } : d)),
    })),

  addInspection: (i) => set((s) => ({ inspections: [i, ...s.inspections] })),
  updateInspection: (id, data) => set((s) => ({ inspections: s.inspections.map((i) => (i.id === id ? { ...i, ...data } : i)) })),
  addInspectionRecord: (r) => set((s) => ({ inspectionRecords: [...s.inspectionRecords, r] })),
  saveInspectionPoint: (inspectionId, pointId, data) => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    let success = true;
    let error: string | undefined;

    set((s) => {
      const updatedPoints = s.inspectionPoints.map((p) =>
        p.id === pointId
          ? {
              ...p,
              status: data.status,
              checkedItems: data.checkedItems,
              photoUrls: data.photoUrls,
              photoFilenames: data.photoFilenames ?? p.photoFilenames,
              notes: data.notes,
              savedAt: now,
            }
          : p
      );

      const inspection = s.inspections.find((i) => i.id === inspectionId);
      if (!inspection) return { inspectionPoints: updatedPoints };

      let pointIdsForInspection: string[];
      if (inspection.pointIds.length > 0) {
        pointIdsForInspection = inspection.pointIds;
      } else {
        const buildingPoints = inspection.buildingIds
          .map((bid) => s.inspectionPoints.filter((p) => p.buildingId === bid))
          .flat();
        pointIdsForInspection = buildingPoints.slice(0, 8).map((p) => p.id);
      }

      const total = pointIdsForInspection.length;
      const newDoneCount = pointIdsForInspection.filter(
        (pid) => updatedPoints.find((p) => p.id === pid)?.status === "done"
      ).length;
      const newProgress = total > 0 ? Math.round((newDoneCount / total) * 100) : 0;
      const oldProgress = inspection.progress;
      const finalProgress = Math.max(oldProgress, newProgress);
      const allDone = finalProgress === 100;

      let newStatus: Inspection["status"] = inspection.status;
      if (finalProgress === 0) {
        newStatus = "pending";
      } else if (finalProgress > 0 && finalProgress < 100) {
        newStatus = "in_progress";
      } else if (finalProgress === 100) {
        newStatus = "completed";
      }

      const updatedInspections = s.inspections.map((i) =>
        i.id === inspectionId
          ? {
              ...i,
              progress: finalProgress,
              status: newStatus,
              completeDate: allDone && !i.completeDate ? now.slice(0, 10) : i.completeDate,
            }
          : i
      );

      return {
        inspectionPoints: updatedPoints,
        inspections: updatedInspections,
      };
    });

    try {
      const toPersist: Partial<PersistState> = {};
      const state = get();
      for (const key of PERSIST_FIELDS) {
        (toPersist as any)[key] = (state as any)[key];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch (e) {
      console.error("[store] localStorage capacity exceeded:", e);
      success = false;
      error = "图片过多超过浏览器存储限制，建议删除部分旧照片后重试";
    }

    return { success, error };
  },

  alignInspectionProgress: (inspectionId) => {
    let correctedProgress = 0;
    set((s) => {
      const inspection = s.inspections.find((i) => i.id === inspectionId);
      if (!inspection) return {};

      let pointIdsForInspection: string[];
      if (inspection.pointIds.length > 0) {
        pointIdsForInspection = inspection.pointIds;
      } else {
        const buildingPoints = inspection.buildingIds
          .map((bid) => s.inspectionPoints.filter((p) => p.buildingId === bid))
          .flat();
        pointIdsForInspection = buildingPoints.slice(0, 8).map((p) => p.id);
      }

      const total = pointIdsForInspection.length;
      const doneCount = pointIdsForInspection.filter(
        (pid) => s.inspectionPoints.find((p) => p.id === pid)?.status === "done"
      ).length;
      const correctProgress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

      if (correctProgress === inspection.progress) {
        correctedProgress = inspection.progress;
        return {};
      }

      correctedProgress = correctProgress;

      let newStatus: Inspection["status"] = inspection.status;
      if (correctProgress === 0) {
        newStatus = "pending";
      } else if (correctProgress > 0 && correctProgress < 100) {
        newStatus = "in_progress";
      } else if (correctProgress === 100) {
        newStatus = "completed";
      }

      const updatedInspections = s.inspections.map((i) =>
        i.id === inspectionId
          ? {
              ...i,
              progress: correctProgress,
              status: newStatus,
            }
          : i
      );

      return { inspections: updatedInspections };
    });
    return correctedProgress;
  },

  addHazard: (h) => set((s) => ({ hazards: [h, ...s.hazards] })),
  updateHazard: (id, data) => set((s) => ({ hazards: s.hazards.map((h) => (h.id === id ? { ...h, ...data } : h)) })),

  assignHazard: (id, params) => {
    const { currentUser, addChangeLog } = get();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    set((s) => ({
      hazards: s.hazards.map((h) => {
        if (h.id !== id) return h;
        const fromStatus = h.status;
        const description = `指派责任人：${params.responsibleName}（${params.responsibleDept}），整改期限：${params.deadline}${params.remark ? `，备注：${params.remark}` : ""}`;
        return {
          ...h,
          responsibleId: params.responsibleId,
          responsibleName: params.responsibleName,
          responsibleDept: params.responsibleDept,
          deadline: params.deadline,
          status: "rectifying" as const,
          history: [
            ...h.history,
            {
              status: "已指派",
              time: timeStr,
              operator: currentUser.name,
              remark: params.remark ? `${params.remark}（责任人：${params.responsibleName}，期限：${params.deadline}）` : `责任人：${params.responsibleName}，期限：${params.deadline}`,
            },
          ],
          statusHistory: [
            ...h.statusHistory,
            {
              time: timeStr,
              fromStatus,
              toStatus: "rectifying" as const,
              operator: currentUser.name,
              description,
            },
          ],
        };
      }),
    }));
    const hazard = get().hazards.find((h) => h.id === id);
    if (hazard) {
      addChangeLog({
        module: "隐患管理",
        recordId: id,
        recordName: hazard.title,
        action: "update",
        fieldName: "状态/责任人",
        oldValue: "待整改/待指派",
        newValue: `整改中/${params.responsibleName}（${params.responsibleDept}）`,
        operatorName: currentUser.name,
      });
    }
  },

  submitHazardRectify: (id, params) => {
    const { currentUser, addChangeLog } = get();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    set((s) => ({
      hazards: s.hazards.map((h) => {
        if (h.id !== id) return h;
        const fromStatus = h.status;
        const description = `提交整改：${params.rectifyMeasures}`;
        return {
          ...h,
          rectifyMeasures: params.rectifyMeasures,
          rectifyPhotos: params.rectifyPhotos || h.rectifyPhotos,
          rectifyDate: dateStr,
          reviewNotes: params.rectifyMeasures,
          status: "reviewing" as const,
          history: [
            ...h.history,
            {
              status: "整改完成",
              time: timeStr,
              operator: currentUser.name,
              remark: params.rectifyMeasures,
            },
          ],
          statusHistory: [
            ...h.statusHistory,
            {
              time: timeStr,
              fromStatus,
              toStatus: "reviewing" as const,
              operator: currentUser.name,
              description,
            },
          ],
        };
      }),
    }));
    const hazard = get().hazards.find((h) => h.id === id);
    if (hazard) {
      addChangeLog({
        module: "隐患管理",
        recordId: id,
        recordName: hazard.title,
        action: "update",
        fieldName: "状态",
        oldValue: "整改中",
        newValue: "待复查",
        operatorName: currentUser.name,
      });
    }
  },

  reviewHazard: (id, params) => {
    const { currentUser, addChangeLog } = get();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    set((s) => ({
      hazards: s.hazards.map((h) => {
        if (h.id !== id) return h;
        const fromStatus = h.status;
        const description = `复查通过：${params.reviewRemark}`;
        return {
          ...h,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          reviewDate: dateStr,
          reviewResult: "pass" as const,
          reviewRemark: params.reviewRemark,
          status: "closed" as const,
          history: [
            ...h.history,
            {
              status: "复查通过",
              time: timeStr,
              operator: currentUser.name,
              remark: params.reviewRemark,
            },
          ],
          statusHistory: [
            ...h.statusHistory,
            {
              time: timeStr,
              fromStatus,
              toStatus: "closed" as const,
              operator: currentUser.name,
              description,
            },
          ],
        };
      }),
    }));
    const hazard = get().hazards.find((h) => h.id === id);
    if (hazard) {
      addChangeLog({
        module: "隐患管理",
        recordId: id,
        recordName: hazard.title,
        action: "update",
        fieldName: "状态",
        oldValue: "待复查",
        newValue: "已关闭",
        operatorName: currentUser.name,
      });
    }
  },

  revertHazard: (id, params) => {
    const { currentUser, addChangeLog } = get();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    set((s) => ({
      hazards: s.hazards.map((h) => {
        if (h.id !== id) return h;
        const fromStatus = h.status;
        const description = `复查退回，需重新整改：${params.reviewRemark}`;
        return {
          ...h,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          reviewDate: dateStr,
          reviewResult: "fail" as const,
          reviewRemark: params.reviewRemark,
          status: "rectifying" as const,
          history: [
            ...h.history,
            {
              status: "复查退回",
              time: timeStr,
              operator: currentUser.name,
              remark: params.reviewRemark,
            },
          ],
          statusHistory: [
            ...h.statusHistory,
            {
              time: timeStr,
              fromStatus,
              toStatus: "rectifying" as const,
              operator: currentUser.name,
              description,
            },
          ],
        };
      }),
    }));
    const hazard = get().hazards.find((h) => h.id === id);
    if (hazard) {
      addChangeLog({
        module: "隐患管理",
        recordId: id,
        recordName: hazard.title,
        action: "update",
        fieldName: "状态",
        oldValue: "待复查",
        newValue: "退回整改",
        operatorName: currentUser.name,
      });
    }
  },

  addDrill: (d) => set((s) => ({ drills: [d, ...s.drills] })),
  updateDrill: (id, data) =>
    set((s) => ({
      drills: s.drills.map((d) => {
        if (d.id !== id) return d;
        const merged: Drill = { ...d, ...data };
        if (data.photoUrls !== undefined) {
          merged.photoUrls = [...data.photoUrls];
        }
        if (data.scores !== undefined) {
          merged.scores = { ...data.scores };
        }
        return merged;
      }),
    })),
  setDrillPhotos: (id, photoUrls) =>
    set((s) => ({
      drills: s.drills.map((d) =>
        d.id === id
          ? {
              ...d,
              photoUrls: [...photoUrls],
            }
          : d
      ),
    })),
  addDrillAttendee: (a) => set((s) => ({ drillAttendees: [...s.drillAttendees, a] })),
  updateDrillScores: (id, scores) =>
    set((s) => ({
      drills: s.drills.map((d) => (d.id === id ? { ...d, scores } : d)),
    })),
  updateDrillComment: (id, comment) =>
    set((s) => ({
      drills: s.drills.map((d) => (d.id === id ? { ...d, comment } : d)),
    })),
  addDrillPhoto: (id, photoUrl) =>
    set((s) => ({
      drills: s.drills.map((d) =>
        d.id === id
          ? {
              ...d,
              photoUrls: [...(d.photoUrls || []), photoUrl].slice(0, 9),
            }
          : d
      ),
    })),
  deleteDrillPhoto: (id, index) =>
    set((s) => ({
      drills: s.drills.map((d) =>
        d.id === id
          ? {
              ...d,
              photoUrls: (d.photoUrls || []).filter((_, i) => i !== index),
            }
          : d
      ),
    })),
  completeDrill: (id) =>
    set((s) => ({
      drills: s.drills.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "completed",
              endTime: new Date().toISOString().slice(0, 16).replace("T", " "),
            }
          : d
      ),
    })),

  createMaintenanceOrder: (data) => {
    const { currentUser, addChangeLog, devices, users } = get();
    const device = devices.find((d) => d.id === data.deviceId);
    const handler = users.find((u) => u.id === data.handlerId);
    if (!device || !handler) return null;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newOrder: MaintenanceOrder = {
      id: `mo${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      buildingId: device.buildingId,
      buildingName: device.buildingName,
      type: data.type,
      sourceStatus: device.status,
      priority: data.priority,
      description: data.description,
      handlerId: handler.id,
      handlerName: handler.name,
      handlerDept: handler.dept,
      expectedDate: data.expectedDate,
      createTime: timeStr,
      status: "pending",
      createdById: currentUser.id,
      createdByName: currentUser.name,
    };

    set((s) => ({
      maintenanceOrders: [newOrder, ...s.maintenanceOrders],
      devices: s.devices.map((d) =>
        d.id === data.deviceId
          ? { ...d, status: "maintenance" as const, currentMaintenanceId: newOrder.id }
          : d
      ),
    }));

    addChangeLog({
      module: "维修保养",
      recordId: newOrder.id,
      recordName: `${newOrder.id} - ${device.name}`,
      action: "create",
      fieldName: "维修单",
      oldValue: "",
      newValue: `指派给${handler.name}（${handler.dept}）`,
      operatorName: currentUser.name,
    });

    return newOrder;
  },

  startMaintenance: (id) => {
    const { currentUser, addChangeLog, maintenanceOrders } = get();
    const order = maintenanceOrders.find((o) => o.id === id);
    if (!order) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    set((s) => ({
      maintenanceOrders: s.maintenanceOrders.map((o) =>
        o.id === id ? { ...o, status: "in_progress" as const, startTime: timeStr } : o
      ),
    }));

    addChangeLog({
      module: "维修保养",
      recordId: id,
      recordName: `${id} - ${order.deviceName}`,
      action: "update",
      fieldName: "状态",
      oldValue: "待处理",
      newValue: "处理中",
      operatorName: currentUser.name,
    });
  },

  completeMaintenance: (id, params) => {
    const { currentUser, addChangeLog, maintenanceOrders } = get();
    const order = maintenanceOrders.find((o) => o.id === id);
    if (!order) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    set((s) => ({
      maintenanceOrders: s.maintenanceOrders.map((o) =>
        o.id === id
          ? {
              ...o,
              status: "completed" as const,
              completeTime: timeStr,
              processRecord: params.processRecord,
              cost: params.cost,
              photoUrls: params.photoUrls || o.photoUrls,
            }
          : o
      ),
      devices: s.devices.map((d) => {
        if (d.id !== order.deviceId) return d;
        const history = d.maintenanceHistory ? [...d.maintenanceHistory, id] : [id];
        return {
          ...d,
          status: "normal" as const,
          currentMaintenanceId: undefined,
          maintenanceHistory: history,
        };
      }),
    }));

    addChangeLog({
      module: "维修保养",
      recordId: id,
      recordName: `${id} - ${order.deviceName}`,
      action: "update",
      fieldName: "状态",
      oldValue: "处理中",
      newValue: "已完成",
      operatorName: currentUser.name,
    });
  },

  getDeviceMaintenanceOrders: (deviceId) => {
    const { maintenanceOrders } = get();
    return maintenanceOrders.filter((o) => o.deviceId === deviceId);
  },

  addChangeLog: (log) => {
    const { currentUser } = get();
    const newLog: ChangeLog = {
      id: `cl${Date.now()}`,
      module: log.module,
      recordId: "",
      recordName: log.recordName,
      action: log.action,
      fieldName: log.fieldName,
      oldValue: log.oldValue,
      newValue: log.newValue,
      operatorId: currentUser.id,
      operatorName: log.operatorName,
      operateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    set((s) => ({ changeLogs: [newLog, ...s.changeLogs] }));
  },

  resetStore: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("[store] Failed to clear localStorage:", e);
    }
    set({
      buildings: mockBuildings,
      devices: mockDevices,
      inspections: mockInspections,
      inspectionPoints: mockInspectionPoints,
      inspectionRecords: [],
      hazards: mockHazards,
      drills: mockDrills,
      drillAttendees: mockDrillAttendees,
      changeLogs: mockChangeLogs,
      users: mockUsers,
      overdueStats: mockOverdueStats,
      monthlyReports: mockMonthlyReports,
      overviewStats: mockOverviewStats,
      todos: mockTodos,
      alerts: mockAlerts,
      maintenanceOrders: mockMaintenanceOrders,
      currentUser: mockUsers[0],
      sidebarCollapsed: false,
      selectedBuildingId: null,
      selectedHazardId: null,
      selectedInspectionId: null,
      selectedDrillId: null,
    });
  },
}));

useAppStore.subscribe((state) => {
  try {
    const toPersist: Partial<PersistState> = {};
    for (const key of PERSIST_FIELDS) {
      (toPersist as any)[key] = state[key];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  } catch (e) {
    console.error("[store] Failed to persist state:", e);
  }
});
