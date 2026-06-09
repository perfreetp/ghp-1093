import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAppStore } from "@/store";
import { riskLevelMap, priorityMap, formatDate, daysUntil, cn } from "@/utils";

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
    default:
      return "任务";
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { overviewStats, buildings, todos, alerts } = useAppStore();

  return (
    <div className="space-y-5 p-6 pattern-grid min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">安全运营总览</h1>
        <p className="text-sm text-slate-500 mt-1">
          实时监控园区消防设施运行状态与安全管理指标
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="card gradient-card-blue p-5 card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-industrial-700/80">在管楼栋数</p>
              <p className="data-number text-4xl text-industrial-700 mt-3">
                {overviewStats.buildingCount}
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
              高风险 {overviewStats.highRiskBuildings} 栋
            </span>
            <span>正常 {buildings.filter(b => b.riskLevel === "normal").length} 栋</span>
          </div>
        </div>

        <div className="card gradient-card-green p-5 card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700/80">设备总数</p>
              <p className="data-number text-4xl text-emerald-700 mt-3">
                {overviewStats.deviceCount}
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
              <p className="text-sm font-medium text-amber-700/80">本月巡检完成率</p>
              <p className="data-number text-4xl text-amber-700 mt-3">
                {overviewStats.inspectionRate}
                <span className="text-base font-normal ml-1 text-amber-600/70">%</span>
              </p>
            </div>
            <ProgressRing value={overviewStats.inspectionRate} />
          </div>
          <div className="mt-4 pt-4 border-t border-amber-200/50 flex items-center justify-between text-xs text-amber-700/70">
            <span className="flex items-center gap-1">
              <ClipboardCheck className="w-3.5 h-3.5" />
              待执行 {overviewStats.pendingInspections} 项
            </span>
            <span>逾期 2 项</span>
          </div>
        </div>

        <div className="card gradient-card-red p-5 card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-fire-700/80">待处理隐患</p>
              <p className="data-number text-4xl text-fire-700 mt-3">
                {overviewStats.pendingHazards}
                <span className="text-base font-normal ml-1 text-fire-600/70">项</span>
              </p>
              <p className="text-xs text-fire-600 mt-1.5 font-medium">高风险 {overviewStats.highRiskBuildings} 栋</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-fire-500/15 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-fire-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-fire-200/50 flex items-center justify-between text-xs text-fire-700/70">
            <span className="flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5" />
              待复查 {overviewStats.pendingReviews} 项
            </span>
            <span>逾期 {overviewStats.overdueHazards} 项</span>
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
              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/buildings/${b.id}`)}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 hover:border-industrial-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{b.name}</h3>
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", rl.className)}>
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
            <span className="badge badge-red text-[11px]">{todos.length} 项待办</span>
          </div>
          <div className="space-y-2.5">
            {todos.map((t) => {
              const pm = priorityMap[t.priority];
              const remain = daysUntil(t.deadline);
              const overdue = remain < 0;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (t.type === "inspection") navigate(`/inspections/${t.relatedId}`);
                    else navigate(`/hazards/${t.relatedId}`);
                  }}
                  className="group relative pl-2.5 rounded-lg border border-slate-200 bg-white p-3 hover:border-industrial-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1", pm.color)} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="badge badge-gray text-[10px] flex items-center gap-1">
                          {todoTypeIcon(t.type)}
                          {todoTypeLabel(t.type)}
                        </span>
                        <span className={cn("text-[10px] font-medium", pm.color === "bg-fire-500" ? "text-fire-600" : pm.color === "bg-warning-500" ? "text-warning-600" : "text-safe-600")}>
                          {pm.label}优先级
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium line-clamp-1 group-hover:text-industrial-700">
                        {t.title}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px]">
                        <CalendarDays className="w-3 h-3 text-slate-400" />
                        <span className={cn(overdue ? "text-fire-600 font-medium" : remain <= 1 ? "text-warning-600 font-medium" : "text-slate-500")}>
                          {overdue ? `已逾期 ${Math.abs(remain)} 天` : remain === 0 ? "今天截止" : `剩余 ${remain} 天`}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-industrial-500 shrink-0 mt-0.5 transition-colors" />
                  </div>
                </div>
              );
            })}
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
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-fire-500" />危险</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning-500" />警告</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-industrial-500" />信息</span>
          </div>
        </div>
        <div className="relative pl-2">
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-4">
            {alerts.map((a) => {
              const cfg = alertLevelConfig(a.level);
              return (
                <div key={a.id} className="relative flex gap-4 group">
                  <div className="relative z-10 shrink-0">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", cfg.ring)}>
                      <div className={cn("w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm", a.level === "danger" && "animate-pulse-danger")}>
                        {cfg.icon}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 rounded-lg border border-slate-200 bg-white p-3.5 group-hover:border-slate-300 group-hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
