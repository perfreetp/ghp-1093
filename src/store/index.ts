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

  addBuilding: (b: Building) => void;
  updateBuilding: (id: string, data: Partial<Building>) => void;
  deleteBuilding: (id: string) => void;

  addDevice: (d: Device) => void;
  updateDevice: (id: string, data: Partial<Device>) => void;
  updateDeviceCheckCycle: (type: string, cycle: string) => void;

  addInspection: (i: Inspection) => void;
  updateInspection: (id: string, data: Partial<Inspection>) => void;
  addInspectionRecord: (r: InspectionRecord) => void;

  addHazard: (h: Hazard) => void;
  updateHazard: (id: string, data: Partial<Hazard>) => void;

  addDrill: (d: Drill) => void;
  updateDrill: (id: string, data: Partial<Drill>) => void;
  addDrillAttendee: (a: DrillAttendee) => void;

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

  addBuilding: (b) => set((s) => ({ buildings: [b, ...s.buildings] })),
  updateBuilding: (id, data) =>
    set((s) => ({
      buildings: s.buildings.map((b) => (b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : b)),
    })),
  deleteBuilding: (id) => set((s) => ({ buildings: s.buildings.filter((b) => b.id !== id) })),

  addDevice: (d) => set((s) => ({ devices: [d, ...s.devices] })),
  updateDevice: (id, data) => set((s) => ({ devices: s.devices.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
  updateDeviceCheckCycle: (type, cycle) =>
    set((s) => ({
      devices: s.devices.map((d) => (d.type === type ? { ...d, checkCycle: cycle as Device["checkCycle"] } : d)),
    })),

  addInspection: (i) => set((s) => ({ inspections: [i, ...s.inspections] })),
  updateInspection: (id, data) => set((s) => ({ inspections: s.inspections.map((i) => (i.id === id ? { ...i, ...data } : i)) })),
  addInspectionRecord: (r) => set((s) => ({ inspectionRecords: [...s.inspectionRecords, r] })),

  addHazard: (h) => set((s) => ({ hazards: [h, ...s.hazards] })),
  updateHazard: (id, data) => set((s) => ({ hazards: s.hazards.map((h) => (h.id === id ? { ...h, ...data } : h)) })),

  addDrill: (d) => set((s) => ({ drills: [d, ...s.drills] })),
  updateDrill: (id, data) => set((s) => ({ drills: s.drills.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
  addDrillAttendee: (a) => set((s) => ({ drillAttendees: [...s.drillAttendees, a] })),

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
