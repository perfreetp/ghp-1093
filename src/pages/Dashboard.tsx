import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
  Building2,
  Cpu,
  ClipboardCheck,
  AlertTriangle,
  Layers,
  Maximize2,
  CalendarDays,
  Search,
  ShieldAlert,
  Wrench,
  RotateCcw,
  AlertOctagon,
  BellRing,
  Info,
  ChevronRight,
  Play,
} from "lucide-react";
import { useAppStore } from "@/store";
import { riskLevelMap, priorityMap, formatDate, daysUntil, cn, roleMap } from "@/utils";

function ProgressRing({ value, size = 72, stroke = 8 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#FEF3C7"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#F59E0B"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-amber-700 font-mono font-bold text-base"
      >
        {value}%
      </text>
    </svg>
  );
}

function todoTypeIcon(type: string) {
  switch (type) {
    case "inspection":
      return <Search className="w-3.5 h-3.5" />;
    case "hazard":
      return <Wrench className="w-3.5 h-3.5" />;
    case "review":
      return <RotateCcw className="w-3.5 h-3.5" />;
    case "maintenance":
      return <Wrench className="w-3.5 h-3.5" />;
    default:
      return <Search className="w-3.5 h-3.5" />;
  }
}

function todoTypeLabel(type: string) {
  switch (type) {
    case "inspection":
      return "巡检";
    case "hazard":
      return "隐患";
    case "review":
      return "复查";
    case "maintenance":
      return "维修";
    default:
      return "任务";
  }
}

function todoActionLabel(type: string) {
  switch (type) {
    case "inspection":
      return "开始巡检";
    case "hazard":
      return "去处理";
    case "review":
      return "前往复查";
    case "maintenance":
      return "开始维修";
    default:
      return "去查看";
  }
}

function alertLevelConfig(level: string) {
  switch (level) {
    case "danger":
      return {
        dot: "bg-fire-500",
        ring: "bg-fire-500/20",
        icon: <AlertOctagon className="w-4 h-4 text-fire-600" />,
        badge: "badge-red",
      };
    case "warning":
      return {
        dot: "bg-warning-500",
        ring: "bg-warning-500/20",
        icon: <AlertTriangle className="w-4 h-4 text-warning-600" />,
        badge: "badge-orange",
      };
    case "info":
    default:
      return {
        dot: "bg-industrial-500",
        ring: "bg-industrial-500/20",
        icon: <Info className="w-4 h-4 text-industrial-600" />,
        badge: "badge-blue",
      };
  }
}

const ADMIN_ROLES = ["director", "manager", "admin"];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    overviewStats,
    buildings,
    todos,
    alerts,
    devices,
    inspections,
    inspectionPoints,
    hazards,
    currentUser,
    currentUserId,
  } = useAppStore();

  const role = currentUser.role;
  const isAdmin = ADMIN_ROLES.includes(role);
  const isInspector = role === "inspector";
  const isEngineer = role === "engineer";

  const stats = useMemo(() => {
    const allBuildings = buildings.length;
    const allDevices = devices.length;
    const allInspections = inspections;
    const allHazards = hazards;

    if (isInspector) {
      const myInspections = allInspections.filter((i) => i.inspectorId === currentUserId);
      const myPointIds = new Set<string>();
      const myBuildingIds = new Set<string>();
      myInspections.forEach((i) => {
        i.buildingIds.forEach((bid) => myBuildingIds.add(bid));
        i.pointIds.forEach((pid) => myPointIds.add(pid));
        if (i.pointIds.length === 0) {
          const buildingPoints = inspectionPoints.filter((p) => i.buildingIds.includes(p.buildingId));
          buildingPoints.slice(0, 8).forEach((p) => {
            myPointIds.add(p.id);
            myBuildingIds.add(p.buildingId);
          });
        }
      });

      const myPoints = inspectionPoints.filter((p) => myPointIds.has(p.id));
      const totalPoints = myPoints.length || 1;
      const donePoints = myPoints.filter((p) => p.status === "done").length;
      const inspectionRate = Math.round((donePoints / totalPoints) * 100);

      const myDevicesInBuildings = devices.filter((d) => myBuildingIds.has(d.buildingId));
      const myDiscoveredHazards = allHazards.filter((h) => h.reporterId === currentUserId);
      const pendingMyHazards = myDiscoveredHazards.filter((h) => h.status !== "closed").length;

      return {
        buildingCount: allBuildings,
        deviceCount: myDevicesInBuildings.length,
        inspectionRate,
        pendingHazards: pendingMyHazards,
        highRiskBuildings: overviewStats.highRiskBuildings,
        pendingInspections: myInspections.filter((i) => i.status === "pending" || i.status === "in_progress").length,
        pendingReviews: myDiscoveredHazards.filter((h) => h.status === "reviewing").length,
        overdueHazards: myDiscoveredHazards.filter(
          (h) => h.status !== "closed" && daysUntil(h.deadline) < 0
        ).length,
      };
    }

    if (isEngineer) {
      const myAssignedHazards = allHazards.filter((h) => h.responsibleId === currentUserId);
      const myBuildingIds = new Set<string>();
      myAssignedHazards.forEach((h) => myBuildingIds.add(h.buildingId));
      const myDevicesInBuildings = devices.filter((d) => myBuildingIds.has(d.buildingId));
      const pendingMyHazards = myAssignedHazards.filter((h) => h.status !== "closed").length;

      return {
        buildingCount: allBuildings,
        deviceCount: myDevicesInBuildings.length,
        inspectionRate: 0,
        pendingHazards: pendingMyHazards,
        highRiskBuildings: overviewStats.highRiskBuildings,
        pendingInspections: 0,
        pendingReviews: myAssignedHazards.filter((h) => h.status === "reviewing").length,
        overdueHazards: myAssignedHazards.filter(
          (h) => h.status !== "closed" && daysUntil(h.deadline) < 0
        ).length,
        showInspectionRate: false,
      };
    }

    return {
      buildingCount: overviewStats.buildingCount,
      deviceCount: overviewStats.deviceCount,
      inspectionRate: overviewStats.inspectionRate,
      pendingHazards: overviewStats.pendingHazards,
      highRiskBuildings: overviewStats.highRiskBuildings,
      pendingInspections: overviewStats.pendingInspections,
      pendingReviews: overviewStats.pendingReviews,
      overdueHazards: overviewStats.overdueHazards,
      showInspectionRate: true,
    };
  }, [
    buildings,
    devices,
    inspections,
    inspectionPoints,
    hazards,
    currentUserId,
    isInspector,
    isEngineer,
    isAdmin,
    overviewStats,
  ]);

  const myBuildingIds = useMemo(() => {
    const ids = new Set<string>();
    if (isInspector) {
      const myInspections = inspections.filter((i) => i.inspectorId === currentUserId);
      myInspections.forEach((i) => {
        i.buildingIds.forEach((bid) => ids.add(bid));
        if (i.pointIds.length === 0) {
          const buildingPoints = inspectionPoints.filter((p) => i.buildingIds.includes(p.buildingId));
          buildingPoints.slice(0, 8).forEach((p) => ids.add(p.buildingId));
        } else {
          i.pointIds.forEach((pid) => {
            const p = inspectionPoints.find((pp) => pp.id === pid);
            if (p) ids.add(p.buildingId);
          });
        }
      });
    }
    if (isEngineer) {
      const myHazards = hazards.filter((h) => h.responsibleId === currentUserId);
      myHazards.forEach((h) => ids.add(h.buildingId));
    }
    return ids;
  }, [inspections, inspectionPoints, hazards, currentUserId, isInspector, isEngineer]);

  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      if (isAdmin) return true;

      if (isInspector) {
        if (t.type === "inspection") {
          const insp = inspections.find((i) => i.id === t.relatedId);
          return insp?.inspectorId === currentUserId;
        }
        if (t.type === "review") {
          const hz = hazards.find((h) => h.id === t.relatedId);
          return hz?.reporterId === currentUserId;
        }
        return false;
      }

      if (isEngineer) {
        if (t.type === "hazard") {
          const hz = hazards.find((h) => h.id === t.relatedId);
          return hz?.responsibleId === currentUserId;
        }
        if (t.type === "review") {
          const hz = hazards.find((h) => h.id === t.relatedId);
          return hz?.responsibleId === currentUserId;
        }
        return false;
      }

      return true;
    });
  }, [todos, inspections, hazards, currentUserId, isAdmin, isInspector, isEngineer]);

  const filteredAlerts = useMemo(() => {
    if (isAdmin) return alerts;

    if (isInspector) {
      const myInspectionIds = new Set(
        inspections.filter((i) => i.inspectorId === currentUserId).map((i) => i.id)
      );
      const myHazardIds = new Set(
        hazards.filter((h) => h.reporterId === currentUserId).map((h) => h.id)
      );
      return alerts.filter((a) => {
        if (a.type === "inspection_miss") return true;
        if (a.type === "hazard_overdue") return true;
        if (a.type === "device_expire") return true;
        return false;
      });
    }

    if (isEngineer) {
      const myHazardIds = new Set(
        hazards.filter((h) => h.responsibleId === currentUserId).map((h) => h.id)
      );
      return alerts.filter((a) => {
        if (a.type === "hazard_overdue") return true;
        if (a.type === "device_expire") return true;
        return false;
      });
    }

    return alerts;
  }, [alerts, inspections, hazards, currentUserId, isAdmin, isInspector, isEngineer]);

  const handleTodoAction = (type: string, relatedId: string) => {
    switch (type) {
      case "inspection":
        navigate("/inspections");
        break;
      case "hazard":
      case "review":
        navigate("/hazards");
        break;
      case "maintenance":
        navigate("/devices");
        break;
      default:
        navigate("/inspections");
    }
  };

  const handleTodoClick = (type: string, relatedId: string) => {
    if (type === "inspection") navigate(`/inspections`);
    else navigate(`/hazards`);
  };

  return (
    <div className="space-y-5 p-6 pattern-grid min-h-full">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-800">安全运营总览</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-industrial-50 border border-industrial-200 text-xs font-medium text-industrial-700">
            <span className="w-2 h-2 rounded-full bg-industrial-500" />
            以 {roleMap[role] || role} 视角查看 · {currentUser.name}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          实时监控园区消防设施运行状态与安全管理指标
        </p>
      </div>

      {isAdmin && (
        <div className="card p-4 bg-gradient-to-r from-industrial-50/80 to-fire-50/60 border-industrial-200/60">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">📊 全局概览</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fire-500" />
              <span className="text-slate-600">
                逾期：<span className="font-semibold text-fire-700">{stats.overdueHazards}</span> 项
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning-500" />
              <span className="text-slate-600">
                待整改：<span className="font-semibold text-warning-700">{stats.pendingHazards}</span> 项
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-industrial-500" />
              <span className="text-slate-600">
                待复查：<span className="font-semibold text-industrial-700">{stats.pendingReviews}</span> 项
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-5">
        <div className="card gradient-card-blue p-5 card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-industrial-700/80">
                {isInspector || isEngineer ? "覆盖楼栋数" : "在管楼栋数"}
              </p>
              <p className="data-number text-4xl text-industrial-700 mt-3">
                {stats.buildingCount}
                <span className="text-base font-normal ml-1 text-industrial-600/70">栋</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-industrial-500/15 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-industrial-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-industrial-200/50 flex items-center justify-between text-xs text-industrial-700/70">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              高风险 {stats.highRiskBuildings} 栋
            </span>
            <span>正常 {buildings.filter((b) => b.riskLevel === "normal").length} 栋</span>
          </div>
        </div>

        <div className="card gradient-card-green p-5 card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700/80">
                {isInspector || isEngineer ? "相关设备数" : "设备总数"}
              </p>
              <p className="data-number text-4xl text-emerald-700 mt-3">
                {stats.deviceCount}
                <span className="text-base font-normal ml-1 text-emerald-600/70">台</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-safe-500/15 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-safe-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-200/50 flex items-center justify-between text-xs text-emerald-700/70">
            <span>正常运行</span>
            <span className="font-medium">在线率 96.8%</span>
          </div>
        </div>

        <div className="card gradient-card-amber p-5 card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700/80">
                {isInspector ? "我的巡检完成率" : isEngineer ? "（不适用）" : "本月巡检完成率"}
              </p>
              <p className="data-number text-4xl text-amber-700 mt-3">
                {isEngineer ? "—" : stats.inspectionRate}
                {!isEngineer && (
                  <span className="text-base font-normal ml-1 text-amber-600/70">%</span>
                )}
              </p>
            </div>
            {!isEngineer && <ProgressRing value={stats.inspectionRate} />}
            {isEngineer && (
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-amber-600" />
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-amber-200/50 flex items-center justify-between text-xs text-amber-700/70">
            <span className="flex items-center gap-1">
              <ClipboardCheck className="w-3.5 h-3.5" />
              待执行 {stats.pendingInspections} 项
            </span>
            <span>{isEngineer ? "工程师视角" : "逾期 2 项"}</span>
          </div>
        </div>

        <div className="card gradient-card-red p-5 card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-fire-700/80">
                {isInspector ? "我发现的隐患" : isEngineer ? "指派给我的隐患" : "待处理隐患"}
              </p>
              <p className="data-number text-4xl text-fire-700 mt-3">
                {stats.pendingHazards}
                <span className="text-base font-normal ml-1 text-fire-600/70">项</span>
              </p>
              {(stats.overdueHazards > 0 || isAdmin) && (
                <p className="text-xs text-fire-600 mt-1.5 font-medium">
                  逾期 {stats.overdueHazards} 项
                </p>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-fire-500/15 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-fire-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-fire-200/50 flex items-center justify-between text-xs text-fire-700/70">
            <span className="flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5" />
              待复查 {stats.pendingReviews} 项
            </span>
            <span>逾期 {stats.overdueHazards} 项</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-industrial-50 flex items-center justify-center">
                <Layers className="w-4.5 h-4.5 text-industrial-600" />
              </div>
              <h2 className="section-title">楼栋风险分布</h2>
              {(isInspector || isEngineer) && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  👤 高亮「我的辖区」
                </span>
              )}
            </div>
            <button
              onClick={() => navigate("/buildings")}
              className="text-xs text-industrial-600 hover:text-industrial-700 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {buildings.map((b) => {
              const rl = riskLevelMap[b.riskLevel];
              const isMyBuilding = myBuildingIds.has(b.id);
              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/buildings`)}
                  className={cn(
                    "rounded-lg border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative",
                    isMyBuilding
                      ? "border-2 border-emerald-300 bg-emerald-50/30 hover:border-emerald-400"
                      : "border-slate-200 bg-slate-50/50 hover:border-industrial-200 hover:bg-white"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">{b.name}</h3>
                      {isMyBuilding && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-medium whitespace-nowrap">
                          👤 我的辖区
                        </span>
                      )}
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", rl.className)}>
                      {rl.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{b.floors} 层</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-3 h-3 text-slate-400" />
                      <span>{b.area.toLocaleString()} ㎡</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CalendarDays className="w-3 h-3" />
                    <span>最近检查 {formatDate(b.lastInspection)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-risk-50 flex items-center justify-center">
                <ClipboardCheck className="w-4.5 h-4.5 text-risk-600" />
              </div>
              <h2 className="section-title">待办任务提醒</h2>
            </div>
            <span className="badge badge-red text-[11px]">{filteredTodos.length} 项待办</span>
          </div>
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredTodos.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>暂无待办任务</p>
              </div>
            ) : (
              filteredTodos.map((t) => {
                const pm = priorityMap[t.priority];
                const remain = daysUntil(t.deadline);
                const overdue = remain < 0;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleTodoClick(t.type, t.relatedId)}
                    className="group relative pl-2.5 rounded-lg border border-slate-200 bg-white p-3 hover:border-industrial-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", pm.color)} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="badge badge-gray text-[10px] flex items-center gap-1">
                            {todoTypeIcon(t.type)}
                            {todoTypeLabel(t.type)}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              pm.color === "bg-fire-500"
                                ? "text-fire-600"
                                : pm.color === "bg-warning-500"
                                ? "text-warning-600"
                                : "text-safe-600"
                            )}
                          >
                            {pm.label}优先级
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium line-clamp-2 group-hover:text-industrial-700">
                          {t.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-[11px]">
                            <CalendarDays className="w-3 h-3 text-slate-400" />
                            <span
                              className={cn(
                                overdue
                                  ? "text-fire-600 font-medium"
                                  : remain <= 1
                                  ? "text-warning-600 font-medium"
                                  : "text-slate-500"
                              )}
                            >
                              {overdue
                                ? `已逾期 ${Math.abs(remain)} 天`
                                : remain === 0
                                ? "今天截止"
                                : `剩余 ${remain} 天`}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTodoAction(t.type, t.relatedId);
                            }}
                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-industrial-50 border border-industrial-200 text-industrial-700 text-[11px] font-medium hover:bg-industrial-100 hover:border-industrial-300 transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            {todoActionLabel(t.type)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fire-50 flex items-center justify-center">
              <BellRing className="w-4.5 h-4.5 text-fire-600" />
            </div>
            <h2 className="section-title">近期预警时间轴</h2>
            {!isAdmin && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                仅显示与我相关的预警
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fire-500" />危险
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning-500" />警告
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-industrial-500" />信息
            </span>
          </div>
        </div>
        <div className="relative pl-2">
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm pl-8">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>暂无相关预警</p>
              </div>
            ) : (
              filteredAlerts.map((a) => {
                const cfg = alertLevelConfig(a.level);
                return (
                  <div key={a.id} className="relative flex gap-4 group">
                    <div className="relative z-10 shrink-0">
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", cfg.ring)}>
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm",
                            a.level === "danger" && "animate-pulse-danger"
                          )}
                        >
                          {cfg.icon}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 rounded-lg border border-slate-200 bg-white p-3.5 group-hover:border-slate-300 group-hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-800">{a.title}</h3>
                          <span className={cn("text-[10px]", cfg.badge)}>
                            {a.level === "danger" ? "危险" : a.level === "warning" ? "警告" : "信息"}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">{a.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
