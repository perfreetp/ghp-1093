import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Building2,
  MapPin,
  Layers,
  Maximize2,
  Calendar,
  Shield,
  Flame,
  Droplets,
  Siren,
  Radio,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/store";
import { cn, riskLevelMap } from "@/utils";
import type { Building, RiskLevel } from "@/types";

type FilterLevel = "all" | RiskLevel;

const levelTabs = [
  { value: "all", label: "全部" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
  { value: "normal", label: "正常" },
] as const;

function BuildingDrawer({
  building,
  onClose,
}: {
  building: Building;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"info" | "facilities" | "history">("info");
  const { changeLogs } = useAppStore();

  const relatedLogs = useMemo(
    () =>
      changeLogs.filter(
        (log) => log.module === "建筑档案" && log.recordId === building.id
      ),
    [changeLogs, building.id]
  );

  const facilityIcons: Record<string, typeof Flame> = {
    自动喷淋: Droplets,
    烟感报警: Radio,
    室内消火栓: Siren,
    室外消火栓: Siren,
    消防电梯: Building2,
    气体灭火: Flame,
    防火卷帘: Layers,
    消防沙池: Flame,
    防火门: Building2,
    应急照明: Siren,
    厨房灭火系统: Flame,
    温度监测: Radio,
    应急广播: Siren,
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-[560px] bg-white shadow-2xl animate-slide-in flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
            <span className="mr-2">🏢</span>
              {building.name}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
              {building.address}
            </p>
          </div>
          <button
            onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 border-b border-slate-100">
          <div className="flex gap-6">
            {(
              [
                { key: "info", label: "基本信息" },
                { key: "facilities", label: "消防设施" },
                { key: "history", label: "变更历史" },
              ] as const
            ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "py-3 text-sm font-medium border-b-2 transition-all",
                    tab === t.key
                      ? "border-industrial-600 text-industrial-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t.label}
                </button>
              ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "info" && (
            <div className="space-y-6 animate-fade-in">
              <div className="relative h-40 rounded-xl bg-gradient-to-br from-industrial-50 to-industrial-100 border border-industrial-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 pattern-grid opacity-60" />
                <Building2 className="w-20 h-20 text-industrial-400 relative z-10" />
                <div className="absolute bottom-4 right-4">
                  <span
                    className={cn(
                      "badge",
                      riskLevelMap[building.riskLevel].className
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        riskLevelMap[building.riskLevel].dotColor
                      )}
                    />
                    {riskLevelMap[building.riskLevel].label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <Layers className="w-4 h-4" />
                    楼层数
                  </div>
                  <div className="text-2xl font-semibold text-slate-800 data-number">
                    {building.floors}
                    <span className="text-sm font-normal text-slate-500 ml-1">层</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <Maximize2 className="w-4 h-4" />
                    建筑面积
                  </div>
                  <div className="text-2xl font-semibold text-slate-800 data-number">
                    {building.area.toLocaleString()}
                    <span className="text-sm font-normal text-slate-500 ml-1">㎡</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <Calendar className="w-4 h-4" />
                    建成年份
                  </div>
                  <div className="text-2xl font-semibold text-slate-800 data-number">
                    {building.buildYear}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <Shield className="w-4 h-4" />
                    最近检查
                  </div>
                  <div className="text-lg font-semibold text-slate-800">
                    {building.lastInspection}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="section-title text-base">
                  <Building2 className="w-4 h-4 text-industrial-600" />
                  详细信息
                </div>
                <div className="rounded-lg border border-slate-100 divide-y divide-slate-50">
                  {[
                    { label: "楼栋编号", value: building.id.toUpperCase() },
                    { label: "楼栋地址", value: building.address },
                    { label: "创建时间", value: building.createdAt },
                    { label: "更新时间", value: building.updatedAt },
                  ].map((item) => (
                    <div key={item.label} className="flex px-4 py-3">
                      <span className="w-24 text-sm text-slate-500 shrink-0">
                        {item.label}
                      </span>
                      <span className="text-sm text-slate-700 font-medium">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "facilities" && (
            <div className="animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {building.fireFacilities.map((f) => {
                  const IconCmp = facilityIcons[f] || Shield;
                  return (
                    <div
                      key={f} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-industrial-50 border border-industrial-100 text-industrial-700 text-sm"
                    >
                      <IconCmp className="w-4 h-4" />
                      {f}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="animate-fade-in">
              {relatedLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  暂无变更记录
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-3 top-1.5 bottom-0 w-px bg-slate-200" />
                  <div className="space-y-5">
                    {relatedLogs.map((log) => (
                      <div key={log.id} className="relative pl-8">
                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-industrial-500 border-2 border-white shadow-sm" />
                        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-800">
                              {log.action === "create" && "新增"}
                              {log.action === "update" && "更新"}
                              {log.action === "delete" && "删除"}
                              {log.fieldName && ` · ${log.fieldName}`}
                            </span>
                            <span className="text-xs text-slate-400">
                              {log.operateTime}
                            </span>
                          </div>
                          {log.oldValue && log.newValue && (
                            <div className="text-sm text-slate-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-1.5 py-0.5 rounded bg-fire-50 text-fire-600 border border-fire-100">
                                  旧值
                                </span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                                <span className="text-xs px-1.5 py-0.5 rounded bg-safe-50 text-safe-600 border border-safe-100">
                                  新值
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {log.oldValue} → {log.newValue}
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-slate-400 mt-2">
                            操作人：{log.operatorName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuildingList() {
  const { buildings } = useAppStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterLevel>("all");
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return buildings.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.address.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || b.riskLevel === filter;
      return matchSearch && matchFilter;
    });
  }, [buildings, search, filter]);

  const detailBuilding = buildings.find((b) => b.id === detailId) || null;

  return (
    <div className="p-6 space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索楼栋名称或地址..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input w-72 pl-9 pr-4"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {levelTabs.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                    filter === t.value
                      ? "bg-white text-industrial-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            新增楼栋
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">楼栋名称</th>
              <th className="table-th">地址</th>
              <th className="table-th text-right">楼层数</th>
              <th className="table-th text-right">建筑面积(㎡)</th>
              <th className="table-th text-right">建成年份</th>
              <th className="table-th">风险等级</th>
              <th className="table-th">最近检查</th>
              <th className="table-th text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="table-row">
                <td className="table-td">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-industrial-50 border border-industrial-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-industrial-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{b.name}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {b.id.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="table-td text-slate-600">{b.address}</td>
                <td className="table-td text-right data-number">
                  {b.floors}
                </td>
                <td className="table-td text-right data-number">
                  {b.area.toLocaleString()}
                </td>
                <td className="table-td text-right data-number">
                  {b.buildYear}
                </td>
                <td className="table-td">
                  <span className={riskLevelMap[b.riskLevel].className}>
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        riskLevelMap[b.riskLevel].dotColor
                      )}
                    />
                    {riskLevelMap[b.riskLevel].label}
                  </span>
                </td>
                <td className="table-td text-slate-600">{b.lastInspection}</td>
                <td className="table-td">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setDetailId(b.id)}
                      title="详情"
                      className="p-1.5 rounded-md text-slate-500 hover:text-industrial-600 hover:bg-industrial-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      title="编辑"
                      className="p-1.5 rounded-md text-slate-500 hover:text-warning-500 hover:bg-amber-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      title="删除"
                      className="p-1.5 rounded-md text-slate-500 hover:text-fire-600 hover:bg-fire-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="card py-16 text-center text-slate-400 text-sm">
          暂无匹配的楼栋数据
        </div>
      )}

      {detailBuilding && (
        <BuildingDrawer
          building={detailBuilding}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
