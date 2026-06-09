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
} from "@/data/mockData";

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
      notes: string;
    }
  ) => void;

  addHazard: (h: Hazard) => void;
  updateHazard: (id: string, data: Partial<Hazard>) => void;
  assignHazard: (id: string, params: { responsibleId: string; responsibleName: string; responsibleDept: string; deadline: string; remark?: string }) => void;
  submitHazardRectify: (id: string, params: { rectifyMeasures: string; rectifyPhotos?: string[] }) => void;
  reviewHazard: (id: string, params: { reviewRemark: string }) => void;
  revertHazard: (id: string, params: { reviewRemark: string }) => void;

  addDrill: (d: Drill) => void;
  updateDrill: (id: string, data: Partial<Drill>) => void;
  addDrillAttendee: (a: DrillAttendee) => void;
  updateDrillScores: (id: string, scores: DrillScores) => void;
  updateDrillComment: (id: string, comment: string) => void;
  addDrillPhoto: (id: string, photoUrl: string) => void;
  deleteDrillPhoto: (id: string, index: number) => void;
  completeDrill: (id: string) => void;

  addChangeLog: (log: Partial<ChangeLog> & { module: string; recordName: string; action: "create" | "update" | "delete"; operatorName: string; fieldName?: string; oldValue?: string; newValue?: string }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
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
  currentUser: mockUsers[0],
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
  saveInspectionPoint: (inspectionId, pointId, data) =>
    set((s) => {
      const now = new Date().toISOString().slice(0, 16).replace("T", " ");
      const updatedPoints = s.inspectionPoints.map((p) =>
        p.id === pointId
          ? {
              ...p,
              status: data.status,
              checkedItems: data.checkedItems,
              photoUrls: data.photoUrls,
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
      const doneCount = pointIdsForInspection.filter(
        (pid) => updatedPoints.find((p) => p.id === pid)?.status === "done"
      ).length;
      const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;
      const allDone = doneCount === total && total > 0;

      const updatedInspections = s.inspections.map((i) =>
        i.id === inspectionId
          ? {
              ...i,
              progress,
              status: (allDone ? "completed" : "in_progress") as Inspection["status"],
              completeDate: allDone ? now.slice(0, 10) : i.completeDate,
            }
          : i
      );

      return {
        inspectionPoints: updatedPoints,
        inspections: updatedInspections,
      };
    }),

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
  updateDrill: (id, data) => set((s) => ({ drills: s.drills.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
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
}));
