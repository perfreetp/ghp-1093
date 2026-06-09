import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppStore } from "@/store";
import {
  inspectionStatusMap,
  inspectionTypeMap,
  inspectionPointStatusMap,
  formatDate,
  cn,
  roleMap,
} from "@/utils";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  Eye,
  Edit2,
  X,
  Calendar,
  Users,
  Building2,
  MapPin,
  QrCode,
  CheckCircle2,
  User,
  Camera,
  FileText,
  Save,
  ChevronUp,
  Lock,
  Unlock,
  ArrowRight,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import type { Inspection, InspectionPoint } from "@/types";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f1f5f9'/%3E%3Cg fill='%2394a3b8'%3E%3Cpath d='M62 60V24c0-2.21-1.79-4-4-4H22c-2.21 0-4 1.79-4 4v36c0 2.21 1.79 4 4 4h36c2.21 0 4-1.79 4-4zM42 40l-8 10-6-8-8 12h44l-14-16c-.78-.9-2.22-.9-3 0l-5 2z'/%3E%3Ccircle cx='30' cy='32' r='4'/%3E%3C/g%3E%3C/svg%3E";

const STATUS_TABS = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待执行" },
  { key: "in_progress", label: "进行中" },
  { key: "completed", label: "已完成" },
  { key: "overdue", label: "已逾期" },
];

interface PointEditState {
  checkedItems: string[];
  photoUrls: string[];
  photoFilenames: string[];
  notes: string;
}

interface LightboxState {
  open: boolean;
  photos: { url: string; name: string }[];
  index: number;
}

interface ScanModalProps {
  open: boolean;
  taskPoints: InspectionPoint[];
  scanningPointIds: Set<string>;
  onClose: () => void;
  onConfirm: (qrCode: string) => { success: boolean; error?: string };
  onMockScan: () => string;
}

function ScanModal({
  open,
  taskPoints,
  scanningPointIds,
  onClose,
  onConfirm,
  onMockScan,
}: ScanModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setInputValue("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const pendingCount = taskPoints.filter(
    (p) => p.status !== "done" && !scanningPointIds.has(p.id)
  ).length;

  const handleMockScan = () => {
    const qr = onMockScan();
    setInputValue(qr);
    setError(null);
  };

  const handleConfirm = () => {
    const result = onConfirm(inputValue.trim());
    if (!result.success) {
      setError(result.error || "校验失败");
    } else {
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-industrial-50 to-slate-50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-industrial-600" />
            <h3 className="text-lg font-semibold text-slate-800">扫码确认点位</h3>
          </div>
          <button
            className="p-1.5 hover:bg-white rounded-md transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="relative h-52 rounded-xl border-2 border-dashed border-industrial-300 bg-gradient-to-br from-industrial-50/80 to-white overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-industrial-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-scan-line" />
            </div>
            <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-industrial-400 rounded-tl" />
            <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-industrial-400 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-industrial-400 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-industrial-400 rounded-br" />

            <QrCode className="w-20 h-20 text-industrial-400 mb-3 relative z-10" />
            <p className="text-sm text-slate-500 relative z-10 font-medium">
              将摄像头对准点位二维码
            </p>
            <p className="text-xs text-slate-400 mt-1 relative z-10">
              待扫点位：<span className="font-semibold text-industrial-600">{pendingCount}</span> 个
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1">
              或手动输入点位码
            </label>
            <input
              type="text"
              className={cn(
                "input transition-colors",
                error && "!border-fire-400 !ring-fire-100 focus:!border-fire-500 focus:!ring-fire-200"
              )}
              placeholder="请输入如 QR-A1-001"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirm();
              }}
            />
            {error && (
              <div className="mt-2 p-2.5 rounded-lg bg-fire-50 border border-fire-200 text-fire-700 text-xs flex items-start gap-2 animate-fade-in">
                <span className="mt-0.5">{error.startsWith("⚠️") ? "⚠️" : "❌"}</span>
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              className="w-full py-2.5 rounded-lg border-2 border-dashed border-industrial-300 bg-industrial-50/50 text-industrial-700 text-sm font-medium hover:bg-industrial-50 hover:border-industrial-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleMockScan}
              disabled={pendingCount === 0}
            >
              <Sparkles className="w-4 h-4" />
              模拟扫码（随机填入未完成点位码）
            </button>
            <div className="flex items-center gap-2">
              <button
                className="flex-1 btn-outline"
                onClick={onClose}
              >
                取消
              </button>
              <button
                className="flex-1 btn-primary"
                onClick={handleConfirm}
                disabled={!inputValue.trim()}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToastProps {
  visible: boolean;
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

function Toast({ visible, message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-in">
      <div
        className={cn(
          "px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3",
          type === "success"
            ? "bg-gradient-to-r from-emerald-500 to-safe-500 text-white"
            : "bg-gradient-to-r from-fire-500 to-fire-600 text-white"
        )}
      >
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
}

interface LightboxProps {
  state: LightboxState;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ state, onClose, onPrev, onNext }: LightboxProps) {
  const { open, photos, index } = state;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open || photos.length === 0) return null;

  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="w-6 h-6" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </>
      )}

      <div
        className="flex flex-col items-center max-w-[95vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.url}
          alt={photo.name}
          className="max-w-5xl max-h-[85vh] object-contain rounded-lg shadow-2xl animate-zoom-in"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
        />
        <div className="mt-4 text-center text-white/90 space-y-1">
          <div className="text-sm font-medium">{photo.name}</div>
          <div className="text-xs text-white/60">
            第 {index + 1} / 共 {photos.length} 张
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InspectionList() {
  const {
    inspections,
    inspectionPoints,
    users,
    buildings,
    addInspection,
    currentUser,
    currentUserId,
    saveInspectionPoint,
    alignInspectionProgress,
    updateInspection,
  } = useAppStore();

  const role = currentUser.role;
  const isInspector = role === "inspector";
  const isAdmin = ["director", "manager", "admin"].includes(role);

  const [activeTab, setActiveTab] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [inspectorFilter, setInspectorFilter] = useState("");

  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(new Set());
  const [pointEdits, setPointEdits] = useState<Record<string, PointEditState>>({});
  const [scanningPointIds, setScanningPointIds] = useState<Set<string>>(new Set());
  const [nextHintPointId, setNextHintPointId] = useState<string | null>(null);

  const [showViewRecordModal, setShowViewRecordModal] = useState(false);
  const [viewRecordPoint, setViewRecordPoint] = useState<InspectionPoint | null>(null);

  const [showScanModal, setShowScanModal] = useState(false);
  const [scanTargetPointId, setScanTargetPointId] = useState<string | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [lightbox, setLightbox] = useState<LightboxState>({
    open: false,
    photos: [],
    index: 0,
  });

  const [newTask, setNewTask] = useState({
    title: "",
    type: "daily" as Inspection["type"],
    buildingIds: [] as string[],
    pointIds: [] as string[],
    inspectorId: "",
    startDate: "",
    endDate: "",
  });

  const inspectors = users.filter((u) => u.role === "inspector");

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const openLightbox = useCallback(
    (photos: { url: string; name: string }[], startIndex = 0) => {
      if (photos.length === 0) return;
      setLightbox({ open: true, photos, index: startIndex });
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setLightbox((s) => ({ ...s, open: false }));
  }, []);

  const lightboxPrev = useCallback(() => {
    setLightbox((s) => ({
      ...s,
      index: s.index <= 0 ? s.photos.length - 1 : s.index - 1,
    }));
  }, []);

  const lightboxNext = useCallback(() => {
    setLightbox((s) => ({
      ...s,
      index: s.index >= s.photos.length - 1 ? 0 : s.index + 1,
    }));
  }, []);

  const filteredInspections = useMemo(() => {
    return inspections.filter((item) => {
      if (isInspector && item.inspectorId !== currentUserId) return false;
      if (activeTab !== "all" && item.status !== activeTab) return false;
      if (dateRange.start && item.startDate < dateRange.start) return false;
      if (dateRange.end && item.endDate > dateRange.end) return false;
      if (inspectorFilter && item.inspectorId !== inspectorFilter) return false;
      return true;
    });
  }, [inspections, activeTab, dateRange, inspectorFilter, isInspector, currentUserId]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const togglePointExpand = (pointId: string) => {
    const point = currentInspectionPoints.find((p) => p.id === pointId);
    if (!point) return;

    const isDone = point.status === "done";
    const isScanning = scanningPointIds.has(pointId);

    if (isDone || isScanning) {
      const next = new Set(expandedPoints);
      if (next.has(pointId)) {
        next.delete(pointId);
      } else {
        next.add(pointId);
      }
      setExpandedPoints(next);
    }
  };

  const getPointsForInspection = (inspection: Inspection): InspectionPoint[] => {
    if (inspection.pointIds.length > 0) {
      return inspection.pointIds
        .map((pid) => inspectionPoints.find((p) => p.id === pid))
        .filter(Boolean) as InspectionPoint[];
    }
    const buildingPoints = inspection.buildingIds
      .map((bid) => inspectionPoints.filter((p) => p.buildingId === bid))
      .flat();
    return buildingPoints.slice(0, 8);
  };

  const getProgressColor = (progress: number, status: Inspection["status"]) => {
    if (status === "overdue") return "bg-fire-500";
    if (status === "completed") return "bg-emerald-500";
    if (progress >= 60) return "bg-emerald-500";
    if (progress >= 30) return "bg-industrial-500";
    return "bg-amber-500";
  };

  const handleBuildingSelect = (buildingId: string) => {
    setNewTask((prev) => {
      const buildingIds = prev.buildingIds.includes(buildingId)
        ? prev.buildingIds.filter((id) => id !== buildingId)
        : [...prev.buildingIds, buildingId];
      return { ...prev, buildingIds };
    });
  };

  const handlePointSelect = (pointId: string) => {
    setNewTask((prev) => {
      const pointIds = prev.pointIds.includes(pointId)
        ? prev.pointIds.filter((id) => id !== pointId)
        : [...prev.pointIds, pointId];
      return { ...prev, pointIds };
    });
  };

  const availablePoints = useMemo(() => {
    if (newTask.buildingIds.length === 0) return inspectionPoints;
    return inspectionPoints.filter((p) =>
      newTask.buildingIds.includes(p.buildingId)
    );
  }, [newTask.buildingIds, inspectionPoints]);

  const handleCreateTask = () => {
    if (
      !newTask.title ||
      !newTask.inspectorId ||
      !newTask.startDate ||
      !newTask.endDate
    ) {
      return;
    }
    const inspector = users.find((u) => u.id === newTask.inspectorId);
    const task: Inspection = {
      id: `i${Date.now()}`,
      title: newTask.title,
      type: newTask.type,
      status: "pending",
      inspectorId: newTask.inspectorId,
      inspectorName: inspector?.name || "",
      buildingIds: newTask.buildingIds,
      pointIds: newTask.pointIds,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      progress: 0,
      createdAt: formatDate(new Date()),
      creatorName: currentUser.name,
    };
    addInspection(task);
    setShowCreateModal(false);
    setNewTask({
      title: "",
      type: "daily",
      buildingIds: [],
      pointIds: [],
      inspectorId: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleOpenInspection = (inspection: Inspection) => {
    alignInspectionProgress(inspection.id);
    const fresh = useAppStore.getState().inspections.find((i) => i.id === inspection.id);
    setSelectedInspection(fresh || inspection);
    const points = getPointsForInspection(fresh || inspection);
    const initialEdits: Record<string, PointEditState> = {};
    points.forEach((p) => {
      initialEdits[p.id] = {
        checkedItems: p.checkedItems ? [...p.checkedItems] : [],
        photoUrls: p.photoUrls ? [...p.photoUrls] : [],
        photoFilenames: p.photoFilenames ? [...p.photoFilenames] : p.photoUrls ? [...p.photoUrls] : [],
        notes: p.notes || "",
      };
    });
    setPointEdits(initialEdits);
    setExpandedPoints(new Set());
    setScanningPointIds(new Set());
    setNextHintPointId(null);
    setShowInspectionModal(true);
  };

  const handleCloseInspection = () => {
    setShowInspectionModal(false);
    setSelectedInspection(null);
    setExpandedPoints(new Set());
    setPointEdits({});
    setScanningPointIds(new Set());
    setNextHintPointId(null);
  };

  const handleToggleCheckItem = (pointId: string, item: string) => {
    setPointEdits((prev) => {
      const current = prev[pointId] || { checkedItems: [], photoUrls: [], photoFilenames: [], notes: "" };
      const hasItem = current.checkedItems.includes(item);
      return {
        ...prev,
        [pointId]: {
          ...current,
          checkedItems: hasItem
            ? current.checkedItems.filter((i) => i !== item)
            : [...current.checkedItems, item],
        },
      };
    });
  };

  const handlePhotoUpload = (pointId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    Promise.all(
      fileArray.map(
        (file) =>
          new Promise<{ url: string; name: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ url: reader.result as string, name: file.name });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    )
      .then((results) => {
        setPointEdits((prev) => {
          const current = prev[pointId] || { checkedItems: [], photoUrls: [], photoFilenames: [], notes: "" };
          return {
            ...prev,
            [pointId]: {
              ...current,
              photoUrls: [...current.photoUrls, ...results.map((r) => r.url)],
              photoFilenames: [...current.photoFilenames, ...results.map((r) => r.name)],
            },
          };
        });
      })
      .catch((err) => {
        console.error("Photo upload failed:", err);
        showToast("图片读取失败，请重试", "error");
      });

    e.target.value = "";
  };

  const handleRemovePhoto = (pointId: string, index: number) => {
    setPointEdits((prev) => {
      const current = prev[pointId] || { checkedItems: [], photoUrls: [], photoFilenames: [], notes: "" };
      return {
        ...prev,
        [pointId]: {
          ...current,
          photoUrls: current.photoUrls.filter((_, i) => i !== index),
          photoFilenames: current.photoFilenames.filter((_, i) => i !== index),
        },
      };
    });
  };

  const handleNotesChange = (pointId: string, value: string) => {
    setPointEdits((prev) => {
      const current = prev[pointId] || { checkedItems: [], photoUrls: [], photoFilenames: [], notes: "" };
      return {
        ...prev,
        [pointId]: {
          ...current,
          notes: value,
        },
      };
    });
  };

  const handleSavePoint = (pointId: string) => {
    if (!selectedInspection) return;
    const edit = pointEdits[pointId] || { checkedItems: [], photoUrls: [], photoFilenames: [], notes: "" };
    const result = saveInspectionPoint(selectedInspection.id, pointId, {
      status: "done",
      checkedItems: edit.checkedItems,
      photoUrls: edit.photoUrls,
      photoFilenames: edit.photoFilenames,
      notes: edit.notes,
    });

    if (!result.success) {
      showToast(result.error || "保存失败", "error");
      return;
    }

    const nextScanning = new Set(scanningPointIds);
    nextScanning.delete(pointId);
    setScanningPointIds(nextScanning);

    const nextExpanded = new Set(expandedPoints);
    nextExpanded.delete(pointId);
    setExpandedPoints(nextExpanded);

    const freshPoints = useAppStore.getState().inspectionPoints;
    const updatedPoints = currentInspectionPoints.map((p) =>
      p.id === pointId
        ? freshPoints.find((fp) => fp.id === pointId) || { ...p, status: "done" as const }
        : p
    );
    const nextPending = updatedPoints.find(
      (p) => p.status !== "done" && !nextScanning.has(p.id)
    );
    const allDone = !updatedPoints.some((p) => p.status !== "done");

    if (allDone) {
      setTimeout(() => {
        setShowInspectionModal(false);
        setSelectedInspection(null);
        setExpandedPoints(new Set());
        setPointEdits({});
        setScanningPointIds(new Set());
        setNextHintPointId(null);
        showToast("🎉 本次巡检任务全部完成！");
      }, 300);
    } else if (nextPending) {
      setNextHintPointId(nextPending.id);
      setTimeout(() => setNextHintPointId(null), 3000);
    }
  };

  const handleViewRecord = (point: InspectionPoint) => {
    setViewRecordPoint(point);
    setShowViewRecordModal(true);
  };

  const handleOpenScan = (pointId: string) => {
    setScanTargetPointId(pointId);
    setShowScanModal(true);
  };

  const handleMockScan = (): string => {
    const pendingPoints = currentInspectionPoints.filter(
      (p) => p.status !== "done" && !scanningPointIds.has(p.id)
    );
    if (pendingPoints.length === 0) return "";
    return pendingPoints[0].qrCode;
  };

  const handleConfirmScan = (qrCode: string): { success: boolean; error?: string } => {
    const matchedPoint = currentInspectionPoints.find((p) => p.qrCode === qrCode);
    if (!matchedPoint) {
      return {
        success: false,
        error: `❌ 点位码「${qrCode}」不属于本次巡检任务`,
      };
    }
    if (matchedPoint.status === "done") {
      return {
        success: false,
        error: `⚠️ 该点位已经巡检完成，无需重复操作`,
      };
    }

    setShowScanModal(false);
    setScanTargetPointId(null);

    const nextScanning = new Set(scanningPointIds);
    nextScanning.add(matchedPoint.id);
    setScanningPointIds(nextScanning);

    const nextExpanded = new Set<string>();
    nextExpanded.add(matchedPoint.id);
    setExpandedPoints(nextExpanded);

    return { success: true };
  };

  const currentInspectionPoints = useMemo(() => {
    if (!selectedInspection) return [];
    return getPointsForInspection(selectedInspection);
  }, [selectedInspection, inspectionPoints]);

  const currentInspection = useMemo(() => {
    if (!selectedInspection) return null;
    return inspections.find((i) => i.id === selectedInspection.id) || selectedInspection;
  }, [selectedInspection, inspections]);

  const getPointDisplayStatus = (point: InspectionPoint): string => {
    if (point.status === "done") return "done";
    if (scanningPointIds.has(point.id)) return "scanning";
    return "pending";
  };

  const renderPhotoThumb = (
    url: string,
    name: string,
    onClick: () => void,
    showRemove: boolean,
    onRemove?: () => void
  ) => (
    <div key={url + name} className="relative group shrink-0">
      <div
        className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-industrial-400 transition-all bg-slate-100"
        onClick={onClick}
      >
        <img
          src={url}
          alt={name}
          className="object-cover w-full h-full rounded-lg"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
        />
      </div>
      {showRemove && onRemove && (
        <button
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-fire-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">巡检任务管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理消防巡检任务的创建、分配和执行进度
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        )}
      </div>

      <div
        className={cn(
          "card px-5 py-3.5 flex items-center gap-3",
          isInspector
            ? "bg-gradient-to-r from-emerald-50 to-industrial-50 border-emerald-200"
            : "bg-gradient-to-r from-industrial-50 to-slate-50 border-industrial-200"
        )}
      >
        <div className="text-2xl">
          {isInspector ? "👷" : "📊"}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {isInspector
              ? `仅显示指派给您的巡检任务（共 ${filteredInspections.length} 条）`
              : `显示全部巡检任务（共 ${filteredInspections.length} 条）`}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isInspector
              ? `当前登录：${currentUser.name} · 巡检员`
              : `角色：${roleMap[currentUser.role] || currentUser.role}，可查看和管理所有任务`}
          </p>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-industrial-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded text-xs",
                  activeTab === tab.key
                    ? "bg-white/20"
                    : "bg-white text-slate-500"
                )}
              >
                {tab.key === "all"
                  ? inspections.length
                  : inspections.filter((i) => i.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              className="input w-40"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, start: e.target.value }))
              }
            />
            <span className="text-slate-400">至</span>
            <input
              type="date"
              className="input w-40"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, end: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <select
              className="input w-40"
              value={inspectorFilter}
              onChange={(e) => setInspectorFilter(e.target.value)}
            >
              <option value="">全部巡检员</option>
              {inspectors.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-outline ml-auto"
            onClick={() => {
              setDateRange({ start: "", end: "" });
              setInspectorFilter("");
            }}
          >
            重置筛选
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th w-10"></th>
              <th className="table-th">任务信息</th>
              <th className="table-th w-48">巡检员</th>
              <th className="table-th w-52">执行周期</th>
              <th className="table-th w-28">状态</th>
              <th className="table-th w-32">创建人</th>
              <th className="table-th w-56">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredInspections.map((inspection) => (
              <>
                <tr
                  key={inspection.id}
                  className={cn(
                    "table-row cursor-pointer",
                    expandedRows.has(inspection.id) && "bg-slate-50"
                  )}
                >
                  <td className="table-td">
                    <button
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                      onClick={() => toggleExpand(inspection.id)}
                    >
                      {expandedRows.has(inspection.id) ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </td>
                  <td className="table-td">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {inspection.title}
                        </span>
                        <span className="badge-blue">
                          {inspectionTypeMap[inspection.type]}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>完成进度</span>
                          <span className="font-medium">{inspection.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={cn(
                              "progress-fill",
                              getProgressColor(inspection.progress, inspection.status)
                            )}
                            style={{ width: `${inspection.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-industrial-100 flex items-center justify-center text-industrial-700 text-xs font-semibold">
                        {inspection.inspectorName.slice(0, 2)}
                      </div>
                      <span className="text-sm">{inspection.inspectorName}</span>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="text-sm space-y-0.5">
                      <div className="text-slate-600">
                        起：{inspection.startDate}
                      </div>
                      <div className="text-slate-600">
                        止：{inspection.endDate}
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className={inspectionStatusMap[inspection.status].className}>
                      {inspectionStatusMap[inspection.status].label}
                    </span>
                  </td>
                  <td className="table-td text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {inspection.creatorName}
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      {(inspection.status === "pending" || inspection.status === "in_progress") && (
                        <button
                          className="btn-ghost text-industrial-600 hover:text-industrial-700 hover:bg-industrial-50 !px-2 !py-1"
                          onClick={() => handleOpenInspection(inspection)}
                        >
                          <Play className="w-4 h-4" />
                          <span className="text-xs">
                            {inspection.status === "pending" ? "开始巡检" : "继续巡检"}
                          </span>
                        </button>
                      )}
                      <button className="btn-ghost text-slate-600 hover:bg-slate-100 !px-2 !py-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">详情</span>
                      </button>
                      <button className="btn-ghost text-slate-600 hover:bg-slate-100 !px-2 !py-1">
                        <Edit2 className="w-4 h-4" />
                        <span className="text-xs">编辑</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(inspection.id) && (
                  <tr key={`${inspection.id}-expanded`}>
                    <td colSpan={7} className="bg-slate-50/50 border-b border-slate-100">
                      <div className="px-12 py-4">
                        <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-industrial-500" />
                          巡检点位（共 {getPointsForInspection(inspection).length} 个）
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {getPointsForInspection(inspection).map((point, idx) => {
                            const pointStatus = point.status || "pending";
                            const isDone = pointStatus === "done";
                            return (
                              <div
                                key={point.id}
                                className={cn(
                                  "p-3 rounded-lg border transition-all",
                                  isDone
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-white border-slate-200 hover:border-industrial-200"
                                )}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                                        isDone
                                          ? "bg-emerald-500 text-white"
                                          : "bg-slate-100 text-slate-600"
                                      )}
                                    >
                                      {isDone ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                      ) : (
                                        idx + 1
                                      )}
                                    </span>
                                    <span className="font-medium text-sm text-slate-800 line-clamp-1">
                                      {point.location}
                                    </span>
                                  </div>
                                  <span className={cn(
                                    "shrink-0",
                                    inspectionPointStatusMap[pointStatus].className
                                  )}>
                                    {inspectionPointStatusMap[pointStatus].label}
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-500 pl-8">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {point.buildingName}
                                  </div>
                                  <div className="flex items-center gap-1 font-mono">
                                    <QrCode className="w-3 h-3" />
                                    {point.qrCode}
                                  </div>
                                  {isDone && (
                                    <button
                                      className="btn-ghost !px-2 !py-1 mt-2 text-industrial-600 hover:bg-industrial-50 w-fit"
                                      onClick={() => handleViewRecord(point)}
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>查看记录</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filteredInspections.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无匹配的巡检任务</p>
          </div>
        )}
      </div>

      {showInspectionModal && currentInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-industrial-50 to-fire-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-slate-800 truncate">
                    {currentInspection.title}
                  </h2>
                  <span className="badge-blue shrink-0">
                    {inspectionTypeMap[currentInspection.type]}
                  </span>
                  <span className={cn("shrink-0", inspectionStatusMap[currentInspection.status].className)}>
                    {inspectionStatusMap[currentInspection.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-industrial-100 flex items-center justify-center text-industrial-700 text-[10px] font-semibold">
                      {currentInspection.inspectorName.slice(0, 2)}
                    </div>
                    <span>巡检员：{currentInspection.inspectorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{currentInspection.startDate} ~ {currentInspection.endDate}</span>
                  </div>
                </div>
              </div>
              <button
                className="p-1.5 hover:bg-white/60 rounded-md transition-colors ml-4"
                onClick={handleCloseInspection}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">
                  整体进度
                </span>
                <span className="font-semibold text-industrial-700">
                  {currentInspection.progress}%
                  <span className="text-xs text-slate-400 ml-1">
                    ({currentInspectionPoints.filter(p => p.status === "done").length}/{currentInspectionPoints.length} 点位)
                  </span>
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={cn(
                    "progress-fill transition-all duration-300",
                    getProgressColor(currentInspection.progress, currentInspection.status)
                  )}
                  style={{ width: `${currentInspection.progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="space-y-4">
                {currentInspectionPoints.map((point, idx) => {
                  const displayStatus = getPointDisplayStatus(point);
                  const isDone = displayStatus === "done";
                  const isScanning = displayStatus === "scanning";
                  const isPending = displayStatus === "pending";
                  const isExpanded = expandedPoints.has(point.id);
                  const edit = pointEdits[point.id] || { checkedItems: [], photoUrls: [], photoFilenames: [], notes: "" };
                  const showHint = nextHintPointId === point.id;
                  const statusInfo = inspectionPointStatusMap[displayStatus];

                  const photosWithNames = edit.photoUrls.map((url, i) => ({
                    url,
                    name: edit.photoFilenames[i] || `照片${i + 1}`,
                  }));

                  return (
                    <div
                      key={point.id}
                      className={cn(
                        "rounded-xl border overflow-hidden transition-all bg-white relative",
                        isDone && "border-emerald-200",
                        isScanning && "border-2 border-dashed border-industrial-400 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
                        isPending && "border-slate-200"
                      )}
                    >
                      {showHint && (
                        <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2 bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 animate-fade-in">
                          <ArrowRight className="w-3.5 h-3.5" />
                          请继续扫描下一个点位
                        </div>
                      )}
                      <div
                        className={cn(
                          "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
                          showHint && "pt-10",
                          isDone && "bg-emerald-50/60 hover:bg-emerald-50",
                          isScanning && "bg-industrial-50/60 hover:bg-industrial-50",
                          isPending && "bg-slate-50 hover:bg-slate-100"
                        )}
                        onClick={() => togglePointExpand(point.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                              isDone && "bg-emerald-500 text-white",
                              isScanning && "bg-industrial-500 text-white",
                              isPending && "bg-slate-200 text-slate-500"
                            )}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isPending ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              idx + 1
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-industrial-500 shrink-0" />
                              <span className="truncate">{point.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {point.buildingName}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <QrCode className="w-3 h-3" />
                                {point.qrCode}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isPending && (
                            <button
                              className={cn(
                                "btn-ghost !px-3 !py-1.5 text-industrial-600 hover:bg-industrial-50 border border-industrial-200",
                                showHint && "animate-pulse"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenScan(point.id);
                              }}
                            >
                              <QrCode className="w-4 h-4" />
                              <span className="text-xs font-medium">扫码/输入点位码</span>
                            </button>
                          )}
                          {isDone && (
                            <button
                              className="btn-ghost !px-2 !py-1 text-industrial-600 hover:bg-industrial-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRecord(point);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                              <span className="text-xs">查看记录</span>
                            </button>
                          )}
                          <span className={cn("shrink-0", statusInfo.className)}>
                            {statusInfo.label}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 py-4 border-t border-slate-100 space-y-4">
                          {isPending ? (
                            <div className="py-12 text-center space-y-3">
                              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                                <Lock className="w-8 h-8 text-slate-400" />
                              </div>
                              <p className="text-sm text-slate-500">该点位尚未扫码，无法编辑巡检内容</p>
                              <button
                                className="btn-primary mt-2"
                                onClick={() => handleOpenScan(point.id)}
                              >
                                <QrCode className="w-4 h-4" />
                                立即扫码解锁
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                              <div className="lg:col-span-2 space-y-4">
                                <div className={cn(
                                  "p-4 rounded-lg border",
                                  isScanning ? "bg-industrial-50 border-industrial-200" : "bg-emerald-50 border-emerald-200"
                                )}>
                                  <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                                    {isScanning ? (
                                      <><Unlock className="w-3.5 h-3.5 text-industrial-600" />已解锁 · 扫描中</>
                                    ) : (
                                      <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />已完成巡检</>
                                    )}
                                  </div>
                                  <div className={cn(
                                    "p-3 rounded border-dashed border text-center",
                                    isScanning
                                      ? "bg-white border-industrial-300"
                                      : "bg-white border-emerald-300"
                                  )}>
                                    <div className={cn(
                                      "w-24 h-24 mx-auto mb-2 rounded-lg flex items-center justify-center border",
                                      isScanning
                                        ? "bg-industrial-50 border-industrial-200"
                                        : "bg-emerald-50 border-emerald-200"
                                    )}>
                                      <QrCode className={cn(
                                        "w-16 h-16",
                                        isScanning ? "text-industrial-600" : "text-emerald-600"
                                      )} />
                                    </div>
                                    <div className="font-mono text-sm font-semibold text-slate-700">
                                      {point.qrCode}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="lg:col-span-3 space-y-4">
                                <div>
                                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    检查项（勾选为合格）
                                  </label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    {point.items.map((item) => {
                                      const checked = edit.checkedItems.includes(item);
                                      return (
                                        <label
                                          key={item}
                                          className={cn(
                                            "flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-all text-sm",
                                            !isScanning && "cursor-default opacity-90",
                                            checked
                                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                              : "bg-white border-slate-200 hover:border-industrial-200 text-slate-700"
                                          )}
                                        >
                                          <input
                                            type="checkbox"
                                            className="rounded text-industrial-600 focus:ring-industrial-500 w-4 h-4"
                                            checked={checked}
                                            disabled={!isScanning}
                                            onChange={() => isScanning && handleToggleCheckItem(point.id, item)}
                                          />
                                          <span className="truncate">{item}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                                    <Camera className="w-3.5 h-3.5" />
                                    上传照片
                                  </label>
                                  <div className="mt-2">
                                    {isScanning ? (
                                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-industrial-50 hover:border-industrial-300 cursor-pointer transition-all text-sm text-slate-600">
                                        <Camera className="w-4 h-4" />
                                        选择图片
                                        <input
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          className="hidden"
                                          onChange={(e) => handlePhotoUpload(point.id, e)}
                                        />
                                      </label>
                                    ) : (
                                      <p className="text-xs text-slate-400">（已锁定）</p>
                                    )}
                                    {edit.photoUrls.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {photosWithNames.map((photo, pIdx) =>
                                          renderPhotoThumb(
                                            photo.url,
                                            photo.name,
                                            () => openLightbox(photosWithNames, pIdx),
                                            isScanning,
                                            () => handleRemovePhoto(point.id, pIdx)
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    备注说明
                                  </label>
                                  <textarea
                                    className="input mt-2 min-h-[80px] resize-y"
                                    placeholder={isScanning ? "请输入巡检备注..." : "（已锁定）"}
                                    value={edit.notes}
                                    disabled={!isScanning}
                                    onChange={(e) => handleNotesChange(point.id, e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {isScanning && (
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                              <button
                                className="btn-primary"
                                onClick={() => handleSavePoint(point.id)}
                              >
                                <Save className="w-4 h-4" />
                                保存此点位
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
              <div className="text-sm text-slate-500">
                已完成 <span className="font-semibold text-emerald-600">{currentInspectionPoints.filter(p => p.status === "done").length}</span> / {currentInspectionPoints.length} 个点位
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn-outline"
                  onClick={handleCloseInspection}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewRecordModal && viewRecordPoint && (() => {
        const recordPhotos = (viewRecordPoint.photoUrls || []).map((url, i) => ({
          url,
          name: (viewRecordPoint.photoFilenames && viewRecordPoint.photoFilenames[i]) || `照片${i + 1}`,
        }));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col m-4">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    巡检记录详情
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {viewRecordPoint.location}
                  </p>
                </div>
                <button
                  className="p-1.5 hover:bg-white/60 rounded-md transition-colors"
                  onClick={() => {
                    setShowViewRecordModal(false);
                    setViewRecordPoint(null);
                  }}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">位置</div>
                    <div className="text-sm font-medium text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-industrial-500" />
                      {viewRecordPoint.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">楼栋</div>
                    <div className="text-sm font-medium text-slate-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-industrial-500" />
                      {viewRecordPoint.buildingName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">二维码</div>
                    <div className="text-sm font-mono font-medium text-slate-800 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-industrial-500" />
                      {viewRecordPoint.qrCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">保存时间</div>
                    <div className="text-sm font-medium text-slate-800">
                      {viewRecordPoint.savedAt || "-"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-industrial-500" />
                    检查项结果
                  </div>
                  <div className="space-y-2">
                    {viewRecordPoint.items.map((item) => {
                      const isChecked = viewRecordPoint.checkedItems?.includes(item);
                      return (
                        <div
                          key={item}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            isChecked
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-slate-50 border-slate-200"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                              isChecked
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-slate-300"
                            )}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span
                            className={cn(
                              "text-sm",
                              isChecked ? "text-emerald-800" : "text-slate-600"
                            )}
                          >
                            {item}
                          </span>
                          <span
                            className={cn(
                              "ml-auto text-xs px-2 py-0.5 rounded-full",
                              isChecked
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-500"
                            )}
                          >
                            {isChecked ? "合格" : "未检/不合格"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {recordPhotos.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-industrial-500" />
                      现场照片（{recordPhotos.length}张）
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {recordPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-industrial-400 transition-all bg-slate-100"
                          onClick={() => openLightbox(recordPhotos, idx)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="object-cover w-full h-full rounded-lg"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-industrial-500" />
                    巡检备注
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[80px]">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {viewRecordPoint.notes || "（无备注）"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50">
                <button
                  className="btn-outline"
                  onClick={() => {
                    setShowViewRecordModal(false);
                    setViewRecordPoint(null);
                  }}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <ScanModal
        open={showScanModal}
        taskPoints={currentInspectionPoints}
        scanningPointIds={scanningPointIds}
        onClose={() => {
          setShowScanModal(false);
          setScanTargetPointId(null);
        }}
        onConfirm={handleConfirmScan}
        onMockScan={handleMockScan}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />

      <Lightbox
        state={lightbox}
        onClose={closeLightbox}
        onPrev={lightboxPrev}
        onNext={lightboxNext}
      />

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">新建巡检任务</h2>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">任务标题</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="请输入任务标题"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">任务类型</label>
                  <select
                    className="input"
                    value={newTask.type}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, type: e.target.value as Inspection["type"] }))
                    }
                  >
                    {Object.entries(inspectionTypeMap).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">巡检员</label>
                  <select
                    className="input"
                    value={newTask.inspectorId}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, inspectorId: e.target.value }))
                    }
                  >
                    <option value="">请选择巡检员</option>
                    {inspectors.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} - {u.dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">开始日期</label>
                  <input
                    type="date"
                    className="input"
                    value={newTask.startDate}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, startDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">结束日期</label>
                  <input
                    type="date"
                    className="input"
                    value={newTask.endDate}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, endDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  选择楼栋
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    已选 {newTask.buildingIds.length} 栋
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-md">
                  {buildings.map((b) => (
                    <label
                      key={b.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all text-sm",
                        newTask.buildingIds.includes(b.id)
                          ? "bg-industrial-50 border border-industrial-200 text-industrial-700"
                          : "hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="rounded text-industrial-600 focus:ring-industrial-500"
                        checked={newTask.buildingIds.includes(b.id)}
                        onChange={() => handleBuildingSelect(b.id)}
                      />
                      <span className="truncate">{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  选择巡检点位
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    已选 {newTask.pointIds.length} 个
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-md">
                  {availablePoints.map((p) => (
                    <label
                      key={p.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all text-sm",
                        newTask.pointIds.includes(p.id)
                          ? "bg-industrial-50 border border-industrial-200 text-industrial-700"
                          : "hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="rounded text-industrial-600 focus:ring-industrial-500"
                        checked={newTask.pointIds.includes(p.id)}
                        onChange={() => handlePointSelect(p.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{p.location}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {p.buildingName} · {p.qrCode}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">创建人</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-industrial-100 flex items-center justify-center text-industrial-700 text-xs font-semibold">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <span className="text-sm text-slate-700">{currentUser.name}</span>
                  <span className="text-xs text-slate-400">({currentUser.dept})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                className="btn-outline"
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateTask}
                disabled={
                  !newTask.title ||
                  !newTask.inspectorId ||
                  !newTask.startDate ||
                  !newTask.endDate
                }
              >
                <Plus className="w-4 h-4" />
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
