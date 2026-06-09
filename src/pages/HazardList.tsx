import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import {
  hazardLevelMap,
  hazardStatusMap,
  formatDateTime,
  daysUntil,
  isOverdue,
  cn,
  roleMap,
} from "@/utils";
import {
  LayoutGrid,
  List,
  Plus,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  Clock,
  X,
  Camera,
  FileText,
  UserCheck,
  Wrench,
  ShieldCheck,
  RotateCcw,
  Send,
  CheckCircle2,
  XCircle,
  Building2,
  Filter,
} from "lucide-react";
import type { Hazard, HazardStatus, HazardLevel } from "@/types";

const KANBAN_COLUMNS: { key: HazardStatus; label: string; borderClass: string; headerClass: string }[] = [
  { key: "pending", label: "待整改", borderClass: "border-l-4 border-fire-500", headerClass: "text-fire-700 bg-fire-50" },
  { key: "rectifying", label: "整改中", borderClass: "border-l-4 border-orange-500", headerClass: "text-orange-700 bg-orange-50" },
  { key: "reviewing", label: "待复查", borderClass: "border-l-4 border-industrial-500", headerClass: "text-industrial-700 bg-industrial-50" },
  { key: "closed", label: "已关闭", borderClass: "border-l-4 border-emerald-500", headerClass: "text-emerald-700 bg-emerald-50" },
];

const LEVEL_FILTERS = [
  { key: "all", label: "全部等级" },
  { key: "major", label: "重大隐患" },
  { key: "larger", label: "较大隐患" },
  { key: "general", label: "一般隐患" },
];

const STATUS_FILTERS = [
  { key: "all", label: "全部状态" },
  { key: "pending", label: "待整改" },
  { key: "rectifying", label: "整改中" },
  { key: "reviewing", label: "待复查" },
  { key: "closed", label: "已关闭" },
];

export default function HazardList() {
  const { hazards, users, updateHazard, addHazard, currentUser, assignHazard, submitHazardRectify, reviewHazard, revertHazard } = useAppStore();

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitRectifyModal, setShowSubmitRectifyModal] = useState(false);
  const [showReviewPassModal, setShowReviewPassModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);

  const [assignForm, setAssignForm] = useState({
    responsibleId: "",
    deadline: "",
    remark: "",
  });
  const [submitRectifyForm, setSubmitRectifyForm] = useState({
    rectifyMeasures: "",
  });
  const [reviewForm, setReviewForm] = useState({
    reviewRemark: "",
  });
  const [revertForm, setRevertForm] = useState({
    reviewRemark: "",
  });

  const [newHazard, setNewHazard] = useState({
    title: "",
    description: "",
    level: "general" as HazardLevel,
    buildingId: "",
    location: "",
    deadline: "",
    responsibleId: "",
  });

  const rectifiers = users.filter((u) => u.role === "rectifier" || u.role === "manager" || u.role === "engineer");
  const assignees = users.filter((u) => u.role === "inspector" || u.role === "engineer");

  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      if (levelFilter !== "all" && h.level !== levelFilter) return false;
      if (statusFilter !== "all" && h.status !== statusFilter) return false;
      return true;
    });
  }, [hazards, levelFilter, statusFilter]);

  const groupedByStatus = useMemo(() => {
    const groups: Record<HazardStatus, Hazard[]> = {
      pending: [],
      rectifying: [],
      reviewing: [],
      closed: [],
    };
    filteredHazards.forEach((h) => {
      groups[h.status].push(h);
    });
    return groups;
  }, [filteredHazards]);

  const getDeadlineStyle = (deadline: string, status: HazardStatus) => {
    if (status === "closed") return "text-slate-400";
    if (isOverdue(deadline)) return "text-fire-600 font-bold";
    const days = daysUntil(deadline);
    if (days <= 3) return "text-fire-600 font-bold";
    if (days <= 7) return "text-orange-600 font-semibold";
    return "text-slate-500";
  };

  const getDeadlineText = (deadline: string, status: HazardStatus) => {
    if (status === "closed") return `截止：${deadline}`;
    if (isOverdue(deadline)) {
      const days = Math.abs(daysUntil(deadline));
      return `已逾期 ${days} 天`;
    }
    const days = daysUntil(deadline);
    if (days === 0) return "今日截止";
    if (days < 0) return `逾期 ${Math.abs(days)} 天`;
    return `剩余 ${days} 天`;
  };

  const getLevelIcon = (level: HazardLevel) => {
    switch (level) {
      case "major":
        return <AlertTriangle className="w-3 h-3" />;
      case "larger":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const getStatusActionConfig = (hazard: Hazard) => {
    const actions: {
      key: string;
      label: string;
      icon: React.ReactNode;
      className: string;
      nextStatus?: HazardStatus;
      show: boolean;
    }[] = [
      {
        key: "assign",
        label: "指派责任人",
        icon: <UserCheck className="w-4 h-4" />,
        className: "btn-primary",
        show: hazard.status === "pending" && !hazard.responsibleId,
      },
      {
        key: "submit_rectify",
        label: "提交整改",
        icon: <Wrench className="w-4 h-4" />,
        className: "btn-primary",
        nextStatus: "reviewing",
        show: hazard.status === "rectifying",
      },
      {
        key: "review_pass",
        label: "复查通过",
        icon: <ShieldCheck className="w-4 h-4" />,
        className: "btn-primary",
        nextStatus: "closed",
        show: hazard.status === "reviewing",
      },
      {
        key: "review_fail",
        label: "复查退回",
        icon: <RotateCcw className="w-4 h-4" />,
        className: "btn-danger",
        nextStatus: "rectifying",
        show: hazard.status === "reviewing",
      },
    ];
    return actions.filter((a) => a.show);
  };

  const openAssignModal = (hazard: Hazard) => {
    setSelectedHazard(hazard);
    setAssignForm({
      responsibleId: "",
      deadline: hazard.deadline,
      remark: "",
    });
    setShowAssignModal(true);
  };

  const handleAssignConfirm = () => {
    if (!selectedHazard || !assignForm.responsibleId || !assignForm.deadline) return;
    const user = users.find((u) => u.id === assignForm.responsibleId);
    if (!user) return;
    assignHazard(selectedHazard.id, {
      responsibleId: user.id,
      responsibleName: user.name,
      responsibleDept: user.dept,
      deadline: assignForm.deadline,
      remark: assignForm.remark,
    });
    const updated = hazards.find((h) => h.id === selectedHazard.id);
    if (updated) setSelectedHazard({ ...updated });
    setShowAssignModal(false);
  };

  const openSubmitRectifyModal = (hazard: Hazard) => {
    setSelectedHazard(hazard);
    setSubmitRectifyForm({ rectifyMeasures: "" });
    setShowSubmitRectifyModal(true);
  };

  const handleSubmitRectifyConfirm = () => {
    if (!selectedHazard || !submitRectifyForm.rectifyMeasures) return;
    submitHazardRectify(selectedHazard.id, {
      rectifyMeasures: submitRectifyForm.rectifyMeasures,
    });
    const updated = hazards.find((h) => h.id === selectedHazard.id);
    if (updated) setSelectedHazard({ ...updated });
    setShowSubmitRectifyModal(false);
  };

  const openReviewPassModal = (hazard: Hazard) => {
    setSelectedHazard(hazard);
    setReviewForm({ reviewRemark: "" });
    setShowReviewPassModal(true);
  };

  const handleReviewPassConfirm = () => {
    if (!selectedHazard) return;
    reviewHazard(selectedHazard.id, {
      reviewRemark: reviewForm.reviewRemark || "复查通过，隐患已消除",
    });
    const updated = hazards.find((h) => h.id === selectedHazard.id);
    if (updated) setSelectedHazard({ ...updated });
    setShowReviewPassModal(false);
  };

  const openRevertModal = (hazard: Hazard) => {
    setSelectedHazard(hazard);
    setRevertForm({ reviewRemark: "" });
    setShowRevertModal(true);
  };

  const handleRevertConfirm = () => {
    if (!selectedHazard || !revertForm.reviewRemark) return;
    revertHazard(selectedHazard.id, {
      reviewRemark: revertForm.reviewRemark,
    });
    const updated = hazards.find((h) => h.id === selectedHazard.id);
    if (updated) setSelectedHazard({ ...updated });
    setShowRevertModal(false);
  };

  const handleRegisterHazard = () => {
    if (
      !newHazard.title ||
      !newHazard.description ||
      !newHazard.buildingId ||
      !newHazard.location ||
      !newHazard.deadline
    ) {
      return;
    }
    const building = useAppStore.getState().buildings.find((b) => b.id === newHazard.buildingId);
    const responsible = users.find((u) => u.id === newHazard.responsibleId);
    const nowTime = formatDateTime(new Date());
    const hazard: Hazard = {
      id: `h${Date.now()}`,
      title: newHazard.title,
      description: newHazard.description,
      level: newHazard.level,
      status: "pending",
      buildingId: newHazard.buildingId,
      buildingName: building?.name || "",
      location: newHazard.location,
      photos: [],
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reportTime: nowTime,
      responsibleId: newHazard.responsibleId,
      responsibleName: responsible?.name || "待指派",
      responsibleDept: responsible?.dept || "",
      deadline: newHazard.deadline,
      history: [
        {
          status: "已登记",
          time: nowTime,
          operator: currentUser.name,
          remark: "用户主动登记",
        },
      ],
      statusHistory: [
        {
          time: nowTime,
          fromStatus: "",
          toStatus: "pending",
          operator: currentUser.name,
          description: "用户主动登记隐患",
        },
      ],
    };
    addHazard(hazard);
    setShowRegisterModal(false);
    setNewHazard({
      title: "",
      description: "",
      level: "general",
      buildingId: "",
      location: "",
      deadline: "",
      responsibleId: "",
    });
  };

  const HazardCard = ({ hazard }: { hazard: Hazard }) => (
    <div
      className={cn(
        "card p-4 cursor-pointer card-hover group",
        "border border-slate-200 hover:shadow-lg"
      )}
      onClick={() => setSelectedHazard(hazard)}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            hazardLevelMap[hazard.level].className,
            "!px-2 !py-0.5"
          )}
        >
          {getLevelIcon(hazard.level)}
          {hazardLevelMap[hazard.level].label.replace("隐患", "")}
        </span>
      </div>

      <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-3 line-clamp-2 group-hover:text-industrial-700 transition-colors">
        {hazard.title}
      </h3>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{hazard.buildingName} {hazard.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{hazard.responsibleName}</span>
        </div>
        <div className={cn("flex items-center gap-1.5", getDeadlineStyle(hazard.deadline, hazard.status))}>
          <Calendar className="w-3.5 h-3.5" />
          <span>{getDeadlineText(hazard.deadline, hazard.status)}</span>
        </div>
      </div>

      <div className="absolute inset-0 rounded-lg ring-2 ring-industrial-400/0 group-hover:ring-industrial-400/30 transition-all pointer-events-none" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">隐患整改看板</h1>
          <p className="text-sm text-slate-500 mt-1">
            跟踪管理安全隐患的全生命周期，确保及时整改闭环
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowRegisterModal(true)}
        >
          <Plus className="w-4 h-4" />
          登记隐患
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all",
                viewMode === "kanban"
                  ? "bg-white text-industrial-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
              看板视图
            </button>
            <button
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all",
                viewMode === "list"
                  ? "bg-white text-industrial-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
              列表视图
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="input w-36"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              {LEVEL_FILTERS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="input w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-sm text-slate-500">
            共 <span className="font-semibold text-slate-700">{filteredHazards.length}</span> 条隐患
          </div>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((col) => (
            <div
              key={col.key}
              className={cn(
                "rounded-xl overflow-hidden bg-slate-50/50",
                col.borderClass
              )}
            >
              <div
                className={cn(
                  "px-4 py-3 flex items-center justify-between font-semibold text-sm",
                  col.headerClass
                )}
              >
                <span>{col.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/70 text-xs font-medium">
                  {groupedByStatus[col.key].length}
                </span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                {groupedByStatus[col.key].length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    暂无数据
                  </div>
                ) : (
                  groupedByStatus[col.key].map((hazard) => (
                    <HazardCard key={hazard.id} hazard={hazard} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">隐患信息</th>
                <th className="table-th w-24">等级</th>
                <th className="table-th w-40">位置</th>
                <th className="table-th w-32">责任人</th>
                <th className="table-th w-32">截止日期</th>
                <th className="table-th w-28">状态</th>
                <th className="table-th w-28">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredHazards.map((hazard) => (
                <tr
                  key={hazard.id}
                  className="table-row cursor-pointer"
                  onClick={() => setSelectedHazard(hazard)}
                >
                  <td className="table-td">
                    <div className="font-medium text-slate-800 line-clamp-1">
                      {hazard.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      登记：{hazard.reportTime} · {hazard.reporterName}
                    </div>
                  </td>
                  <td className="table-td">
                    <span className={hazardLevelMap[hazard.level].className}>
                      {hazardLevelMap[hazard.level].label.replace("隐患", "")}
                    </span>
                  </td>
                  <td className="table-td text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{hazard.buildingName}</span>
                    </div>
                  </td>
                  <td className="table-td text-sm text-slate-600">
                    {hazard.responsibleName}
                  </td>
                  <td className="table-td">
                    <div className={cn("text-sm", getDeadlineStyle(hazard.deadline, hazard.status))}>
                      <div>{hazard.deadline}</div>
                      <div className="text-xs">{getDeadlineText(hazard.deadline, hazard.status)}</div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className={hazardStatusMap[hazard.status].className}>
                      {hazardStatusMap[hazard.status].label}
                    </span>
                  </td>
                  <td className="table-td" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-ghost !px-2 !py-1 text-industrial-600 hover:bg-industrial-50">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">详情</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedHazard && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedHazard(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-800">隐患详情</h2>
                <span className={hazardStatusMap[selectedHazard.status].className}>
                  {hazardStatusMap[selectedHazard.status].label}
                </span>
              </div>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setSelectedHazard(null)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <span className={hazardLevelMap[selectedHazard.level].className}>
                    {getLevelIcon(selectedHazard.level)}
                    {hazardLevelMap[selectedHazard.level].label}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {selectedHazard.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      登记人：{selectedHazard.reporterName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {selectedHazard.reportTime}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">现场照片</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {(selectedHazard.photos.length > 0
                      ? selectedHazard.photos
                      : ["placeholder"]
                    ).map((_, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg bg-slate-100 border border-slate-200 border-dashed flex items-center justify-center"
                      >
                        <div className="text-center text-slate-400">
                          <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span className="text-xs">照片{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">隐患描述</h4>
                  <div className="p-4 rounded-lg bg-slate-50 text-sm text-slate-600 leading-relaxed">
                    {selectedHazard.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">隐患位置</h4>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {selectedHazard.buildingName} {selectedHazard.location}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">整改责任人</h4>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 text-sm">
                      <div className="w-6 h-6 rounded-full bg-industrial-100 flex items-center justify-center text-industrial-700 text-xs font-semibold">
                        {selectedHazard.responsibleName.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-slate-700">{selectedHazard.responsibleName}</div>
                        {selectedHazard.responsibleDept && (
                          <div className="text-xs text-slate-400">{selectedHazard.responsibleDept}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">整改期限</h4>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm",
                        isOverdue(selectedHazard.deadline)
                          ? "bg-fire-50"
                          : "bg-slate-50"
                      )}
                    >
                      <Calendar
                        className={cn(
                          "w-4 h-4",
                          isOverdue(selectedHazard.deadline)
                            ? "text-fire-500"
                            : "text-slate-400"
                        )}
                      />
                      <span
                        className={cn(
                          "font-medium",
                          getDeadlineStyle(selectedHazard.deadline, selectedHazard.status)
                        )}
                      >
                        {selectedHazard.deadline}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          getDeadlineStyle(selectedHazard.deadline, selectedHazard.status)
                        )}
                      >
                        ({getDeadlineText(selectedHazard.deadline, selectedHazard.status)})
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">隐患编号</h4>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 text-sm font-mono text-slate-600">
                      {selectedHazard.id.toUpperCase()}
                    </div>
                  </div>
                </div>

                {selectedHazard.rectifyMeasures && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">整改措施</h4>
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 leading-relaxed">
                      {selectedHazard.rectifyMeasures}
                    </div>
                  </div>
                )}

                {selectedHazard.reviewRemark && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">复查意见</h4>
                    <div className="p-4 rounded-lg bg-industrial-50 border border-industrial-100 text-sm text-industrial-800 leading-relaxed">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedHazard.reviewResult === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-fire-600" />
                        )}
                        <span className="font-medium">
                          {selectedHazard.reviewResult === "pass" ? "复查通过" : "复查退回"}
                        </span>
                      </div>
                      {selectedHazard.reviewRemark}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">状态变更时间轴</h4>
                  <div className="relative pl-8 space-y-6">
                    <div className="absolute left-3 top-1 bottom-1 w-0.5 bg-slate-200" />
                    {(selectedHazard.statusHistory && selectedHazard.statusHistory.length > 0
                      ? selectedHazard.statusHistory
                      : selectedHazard.history.map((h) => ({
                          time: h.time,
                          fromStatus: "",
                          toStatus: "" as any,
                          operator: h.operator,
                          description: `${h.status}${h.remark ? " - " + h.remark : ""}`,
                        }))
                    ).map((item, idx, arr) => (
                      <div key={idx} className="relative">
                        <div
                          className={cn(
                            "absolute -left-5 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white",
                            idx === arr.length - 1
                              ? "border-industrial-500 bg-industrial-500"
                              : "border-slate-300"
                          )}
                        >
                          {idx === arr.length - 1 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="pt-0.5">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {item.fromStatus && item.toStatus ? (
                              <>
                                <span className={hazardStatusMap[item.fromStatus]?.className || "badge-gray"}>
                                  {hazardStatusMap[item.fromStatus]?.label || item.fromStatus}
                                </span>
                                <span className="text-slate-400">→</span>
                                <span className={hazardStatusMap[item.toStatus]?.className || "badge-gray"}>
                                  {hazardStatusMap[item.toStatus]?.label || item.toStatus}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium text-sm text-slate-800">
                                {selectedHazard.history[idx]?.status || "状态变更"}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">{item.time}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            操作人：{item.operator}
                            {item.description && (
                              <>
                                <span className="mx-1 text-slate-300">·</span>
                                {item.description}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-end gap-2">
                {getStatusActionConfig(selectedHazard).map((action) => (
                  <button
                    key={action.key}
                    className={action.className}
                    onClick={() => {
                      if (action.key === "assign") openAssignModal(selectedHazard);
                      else if (action.key === "submit_rectify") openSubmitRectifyModal(selectedHazard);
                      else if (action.key === "review_pass") openReviewPassModal(selectedHazard);
                      else if (action.key === "review_fail") openRevertModal(selectedHazard);
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
                {getStatusActionConfig(selectedHazard).length === 0 && (
                  <span className="text-sm text-slate-400">当前状态无可用操作</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-fire-500" />
                登记安全隐患
              </h2>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setShowRegisterModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">隐患标题</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="简要描述隐患问题"
                    value={newHazard.title}
                    onChange={(e) =>
                      setNewHazard((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">隐患等级</label>
                  <select
                    className="input"
                    value={newHazard.level}
                    onChange={(e) =>
                      setNewHazard((p) => ({ ...p, level: e.target.value as HazardLevel }))
                    }
                  >
                    {Object.entries(hazardLevelMap).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">整改期限</label>
                  <input
                    type="date"
                    className="input"
                    value={newHazard.deadline}
                    onChange={(e) =>
                      setNewHazard((p) => ({ ...p, deadline: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">所在楼栋</label>
                  <select
                    className="input"
                    value={newHazard.buildingId}
                    onChange={(e) =>
                      setNewHazard((p) => ({ ...p, buildingId: e.target.value }))
                    }
                  >
                    <option value="">请选择楼栋</option>
                    {useAppStore.getState().buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">具体位置</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="如：3层东侧走廊"
                    value={newHazard.location}
                    onChange={(e) =>
                      setNewHazard((p) => ({ ...p, location: e.target.value }))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className="label">整改责任人（可选）</label>
                  <select
                    className="input"
                    value={newHazard.responsibleId}
                    onChange={(e) =>
                      setNewHazard((p) => ({ ...p, responsibleId: e.target.value }))
                    }
                  >
                    <option value="">稍后指派</option>
                    {rectifiers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} - {u.dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">详细描述</label>
                  <textarea
                    className="input min-h-[120px] resize-none"
                    placeholder="请详细描述隐患的具体情况、可能造成的影响等..."
                    value={newHazard.description}
                    onChange={(e) =>
                      setNewHazard((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                className="btn-outline"
                onClick={() => setShowRegisterModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleRegisterHazard}
                disabled={
                  !newHazard.title ||
                  !newHazard.description ||
                  !newHazard.buildingId ||
                  !newHazard.location ||
                  !newHazard.deadline
                }
              >
                <Send className="w-4 h-4" />
                提交登记
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedHazard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-industrial-500" />
                指派责任人
              </h2>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setShowAssignModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="p-3 rounded-lg bg-industrial-50 border border-industrial-100">
                <div className="text-sm font-medium text-industrial-800 mb-1">{selectedHazard.title}</div>
                <div className="text-xs text-industrial-600">{selectedHazard.buildingName} · {selectedHazard.location}</div>
              </div>

              <div>
                <label className="label">整改责任人 <span className="text-fire-500">*</span></label>
                <select
                  className="input"
                  value={assignForm.responsibleId}
                  onChange={(e) => setAssignForm((p) => ({ ...p, responsibleId: e.target.value }))}
                >
                  <option value="">请选择责任人</option>
                  {assignees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.dept}（{roleMap[u.role] || u.role}）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">整改期限 <span className="text-fire-500">*</span></label>
                <input
                  type="date"
                  className="input"
                  value={assignForm.deadline}
                  onChange={(e) => setAssignForm((p) => ({ ...p, deadline: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">指派备注</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="请输入指派备注说明（可选）"
                  value={assignForm.remark}
                  onChange={(e) => setAssignForm((p) => ({ ...p, remark: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                className="btn-outline"
                onClick={() => setShowAssignModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleAssignConfirm}
                disabled={!assignForm.responsibleId || !assignForm.deadline}
              >
                <UserCheck className="w-4 h-4" />
                确认指派
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitRectifyModal && selectedHazard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" />
                提交整改
              </h2>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setShowSubmitRectifyModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                <div className="text-sm font-medium text-orange-800 mb-1">{selectedHazard.title}</div>
                <div className="text-xs text-orange-600">责任人：{selectedHazard.responsibleName} · 截止：{selectedHazard.deadline}</div>
              </div>

              <div>
                <label className="label">整改说明 <span className="text-fire-500">*</span></label>
                <textarea
                  className="input min-h-[120px] resize-none"
                  placeholder="请详细描述整改措施、处理过程和完成情况..."
                  value={submitRectifyForm.rectifyMeasures}
                  onChange={(e) => setSubmitRectifyForm((p) => ({ ...p, rectifyMeasures: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">整改照片</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="text-center text-slate-400">
                        <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-xs">上传{idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-slate-400">（照片功能占位，暂未实现上传）</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                className="btn-outline"
                onClick={() => setShowSubmitRectifyModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmitRectifyConfirm}
                disabled={!submitRectifyForm.rectifyMeasures}
              >
                <Send className="w-4 h-4" />
                提交复查
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewPassModal && selectedHazard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                确认复查通过
              </h2>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setShowReviewPassModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-sm font-medium text-emerald-800 mb-1">{selectedHazard.title}</div>
                <div className="text-xs text-emerald-600">整改措施：{selectedHazard.rectifyMeasures || "已完成整改"}</div>
              </div>

              <div>
                <label className="label">复查意见</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="请输入复查验收意见（可选，默认：复查通过，隐患已消除）"
                  value={reviewForm.reviewRemark}
                  onChange={(e) => setReviewForm((p) => ({ ...p, reviewRemark: e.target.value }))}
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700">
                  确认通过后，该隐患状态将变更为"已关闭"，完成整个整改闭环流程。
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                className="btn-outline"
                onClick={() => setShowReviewPassModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleReviewPassConfirm}
                style={{ backgroundColor: "#059669", borderColor: "#059669" }}
              >
                <CheckCircle2 className="w-4 h-4" />
                确认通过
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevertModal && selectedHazard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-fire-500" />
                退回整改
              </h2>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setShowRevertModal(false)}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3 rounded-lg bg-fire-50 border border-fire-100">
                <div className="text-sm font-medium text-fire-800 mb-1">{selectedHazard.title}</div>
                <div className="text-xs text-fire-600">当前整改人：{selectedHazard.responsibleName}</div>
              </div>

              <div>
                <label className="label">退回原因 <span className="text-fire-500">*</span></label>
                <textarea
                  className="input min-h-[120px] resize-none"
                  placeholder="请详细说明退回整改的原因、需要补充完善的内容..."
                  value={revertForm.reviewRemark}
                  onChange={(e) => setRevertForm((p) => ({ ...p, reviewRemark: e.target.value }))}
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700">
                  退回后，该隐患状态将回到"整改中"，责任人需根据退回意见重新进行整改。
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                className="btn-outline"
                onClick={() => setShowRevertModal(false)}
              >
                取消
              </button>
              <button
                className="btn-danger"
                onClick={handleRevertConfirm}
                disabled={!revertForm.reviewRemark}
              >
                <XCircle className="w-4 h-4" />
                确认退回
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
