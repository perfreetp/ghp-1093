import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import { priorityMap, formatDate } from "@/utils";
import PageShell from "@/pages/PageShell";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import {
  BarChart3,
  FileWarning,
  FileDown,
  History,
  Bell,
  Search,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  FileText,
  ClipboardCheck,
  ShieldAlert,
  Flame,
  Wrench,
  Building2,
  UserCircle2,
  ArrowRightLeft,
  ChevronRight,
  AlertCircle,
  CircleDot,
} from "lucide-react";

const reportTabs = [
  { key: "overdue", label: "逾期统计", icon: FileWarning },
  { key: "monthly", label: "月报导出", icon: FileDown },
  { key: "history", label: "历史变更", icon: History },
  { key: "todo", label: "待办提醒", icon: Bell },
];

const moduleFilters = [
  "全部",
  "建筑档案",
  "设备台账",
  "巡检任务",
  "隐患管理",
  "演练记录",
];

const actionMap: Record<string, { label: string; className: string }> = {
  create: { label: "新增", className: "badge-green" },
  update: { label: "修改", className: "badge-blue" },
  delete: { label: "删除", className: "badge-red" },
};

const todoTypeMap: Record<string, { label: string; icon: typeof ClipboardCheck; color: string }> = {
  inspection: { label: "巡检任务", icon: ClipboardCheck, color: "text-industrial-600 bg-industrial-50 border-industrial-200" },
  hazard: { label: "隐患整改", icon: ShieldAlert, color: "text-fire-600 bg-fire-50 border-fire-200" },
  review: { label: "复查验收", icon: CheckCircle2, color: "text-safe-600 bg-emerald-50 border-emerald-200" },
};

export default function Reports() {
  const { overdueStats, monthlyReports, changeLogs, todos, users } = useAppStore();
  const [activeTab, setActiveTab] = useState("overdue");
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [moduleFilter, setModuleFilter] = useState("全部");
  const [operatorFilter, setOperatorFilter] = useState("全部");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [changeSearch, setChangeSearch] = useState("");

  const overdueChartOption: EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        data: ["巡检逾期", "整改逾期", "设备过期"],
        top: 0,
        right: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 12, color: "#64748b" },
      },
      grid: {
        left: 40,
        right: 20,
        top: 50,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: overdueStats.map((s) => s.dept),
        axisLabel: { color: "#64748b", fontSize: 12 },
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#64748b", fontSize: 12 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: "巡检逾期",
          type: "bar",
          barWidth: 18,
          itemStyle: {
            color: "#3B82F6",
            borderRadius: [4, 4, 0, 0],
          },
          data: overdueStats.map((s) => s.inspectionOverdue),
        },
        {
          name: "整改逾期",
          type: "bar",
          barWidth: 18,
          itemStyle: {
            color: "#F97316",
            borderRadius: [4, 4, 0, 0],
          },
          data: overdueStats.map((s) => s.hazardOverdue),
        },
        {
          name: "设备过期",
          type: "bar",
          barWidth: 18,
          itemStyle: {
            color: "#DC2626",
            borderRadius: [4, 4, 0, 0],
          },
          data: overdueStats.map((s) => s.deviceExpired),
        },
      ],
    };
  }, [overdueStats]);

  const monthlyChartOption: EChartsOption = useMemo(() => {
    const months = monthlyReports.map((r) => r.month.slice(5) + "月");
    return {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["巡检总数", "完成数", "隐患总数", "关闭数", "演练数"],
        top: 0,
        right: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 12, color: "#64748b" },
      },
      grid: {
        left: 40,
        right: 20,
        top: 50,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: months,
        boundaryGap: false,
        axisLabel: { color: "#64748b", fontSize: 12 },
        axisLine: { lineStyle: { color: "#e2e8f0" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#64748b", fontSize: 12 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: "巡检总数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { width: 2.5, color: "#3B82F6" },
          itemStyle: { color: "#3B82F6" },
          data: monthlyReports.map((r) => r.inspectionTotal),
        },
        {
          name: "完成数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { width: 2.5, color: "#059669" },
          itemStyle: { color: "#059669" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(5, 150, 105, 0.18)" },
                { offset: 1, color: "rgba(5, 150, 105, 0)" },
              ],
            },
          },
          data: monthlyReports.map((r) => r.inspectionCompleted),
        },
        {
          name: "隐患总数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { width: 2.5, color: "#F97316" },
          itemStyle: { color: "#F97316" },
          data: monthlyReports.map((r) => r.hazardTotal),
        },
        {
          name: "关闭数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { width: 2.5, color: "#8B5CF6" },
          itemStyle: { color: "#8B5CF6" },
          data: monthlyReports.map((r) => r.hazardClosed),
        },
        {
          name: "演练数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { width: 2.5, color: "#DC2626" },
          itemStyle: { color: "#DC2626" },
          data: monthlyReports.map((r) => r.drillCount),
        },
      ],
    };
  }, [monthlyReports]);

  const selectedMonthReport = useMemo(() => {
    return monthlyReports.find((r) => r.month === selectedMonth);
  }, [monthlyReports, selectedMonth]);

  const filteredChangeLogs = useMemo(() => {
    return changeLogs.filter((log) => {
      if (moduleFilter !== "全部" && log.module !== moduleFilter) return false;
      if (operatorFilter !== "全部" && log.operatorName !== operatorFilter) return false;
      if (dateRange.start && log.operateTime.slice(0, 10) < dateRange.start) return false;
      if (dateRange.end && log.operateTime.slice(0, 10) > dateRange.end) return false;
      if (changeSearch) {
        const s = changeSearch.toLowerCase();
        if (
          !log.recordName.toLowerCase().includes(s) &&
          !log.operatorName.toLowerCase().includes(s) &&
          !(log.fieldName || "").toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [changeLogs, moduleFilter, operatorFilter, dateRange, changeSearch]);

  const todoSummary = useMemo(() => {
    const summary: Record<string, { label: string; count: number; urgent: number; icon: typeof ClipboardCheck; color: string }> = {
      inspection: { label: "巡检任务", count: 0, urgent: 0, icon: ClipboardCheck, color: "from-industrial-500 to-industrial-600" },
      hazard: { label: "隐患整改", count: 0, urgent: 0, icon: ShieldAlert, color: "from-fire-500 to-fire-600" },
      review: { label: "复查验收", count: 0, urgent: 0, icon: CheckCircle2, color: "from-safe-500 to-safe-600" },
    };
    todos.forEach((t) => {
      summary[t.type].count++;
      if (t.priority === "high") summary[t.type].urgent++;
    });
    return summary;
  }, [todos]);

  const totalUrgent = Object.values(todoSummary).reduce((sum, s) => sum + s.urgent, 0);

  return (
    <PageShell
      title="统计报表"
      description="数据统计分析、月报导出与变更追溯"
      actions={
        <button className="btn-outline">
          <Download className="w-4 h-4" />
          导出报表
        </button>
      }
    >
      <div className="card p-1.5 mb-5 inline-flex">
        {reportTabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-industrial-600 text-white shadow-md shadow-industrial-600/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

        {activeTab === "overdue" && (
          <div className="space-y-6 animate-fade-in">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">
                  <AlertTriangle className="w-5 h-5 text-fire-600" />
                  按部门逾期统计
                </h3>
                <span className="text-sm text-slate-500">
                  更新时间：{formatDate(new Date())}
                </span>
              </div>
              <ReactECharts
                option={overdueChartOption}
                style={{ height: 360 }}
                notMerge
              />
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="section-title">
                  <FileText className="w-5 h-5 text-industrial-600" />
                  逾期明细数据
                </h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">部门</th>
                    <th className="table-th text-center">巡检逾期数</th>
                    <th className="table-th text-center">整改逾期数</th>
                    <th className="table-th text-center">设备过期数</th>
                    <th className="table-th text-center">合计</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueStats.map((s) => {
                    const total = s.inspectionOverdue + s.hazardOverdue + s.deviceExpired;
                    return (
                      <tr key={s.dept} className="table-row">
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-800">{s.dept}</span>
                          </div>
                        </td>
                        <td className="table-td text-center">
                          <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-sm font-semibold data-number ${
                            s.inspectionOverdue > 0 ? "bg-industrial-50 text-industrial-700" : "text-slate-400"
                          }`}>
                            {s.inspectionOverdue}
                          </span>
                        </td>
                        <td className="table-td text-center">
                          <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-sm font-semibold data-number ${
                            s.hazardOverdue > 0 ? "bg-orange-50 text-orange-700" : "text-slate-400"
                          }`}>
                            {s.hazardOverdue}
                          </span>
                        </td>
                        <td className="table-td text-center">
                          <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-sm font-semibold data-number ${
                            s.deviceExpired > 0 ? "bg-fire-50 text-fire-700" : "text-slate-400"
                          }`}>
                            {s.deviceExpired}
                          </span>
                        </td>
                        <td className="table-td text-center">
                          <span className={`text-base font-bold data-number ${total > 0 ? "text-fire-600" : "text-slate-400"}`}>
                            {total}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50/60">
                    <td className="table-td font-semibold text-slate-800">总计</td>
                    <td className="table-td text-center font-bold text-industrial-700 data-number">
                      {overdueStats.reduce((s, r) => s + r.inspectionOverdue, 0)}
                    </td>
                    <td className="table-td text-center font-bold text-orange-700 data-number">
                      {overdueStats.reduce((s, r) => s + r.hazardOverdue, 0)}
                    </td>
                    <td className="table-td text-center font-bold text-fire-700 data-number">
                      {overdueStats.reduce((s, r) => s + r.deviceExpired, 0)}
                    </td>
                    <td className="table-td text-center font-bold text-fire-600 text-base data-number">
                      {overdueStats.reduce((s, r) => s + r.inspectionOverdue + r.hazardOverdue + r.deviceExpired, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <div className="space-y-6 animate-fade-in">
            <div className="card p-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <label className="text-sm text-slate-600">选择月份：</label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="input pr-8 appearance-none min-w-[140px] cursor-pointer"
                  >
                    {["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1" />
              <button className="btn-primary">
                <FileDown className="w-4 h-4" />
                导出PDF
              </button>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">
                  <BarChart3 className="w-5 h-5 text-industrial-600" />
                  6个月趋势分析
                </h3>
              </div>
              <ReactECharts
                option={monthlyChartOption}
                style={{ height: 380 }}
                notMerge
              />
            </div>

            {selectedMonthReport && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="section-title">
                    <ClipboardCheck className="w-5 h-5 text-industrial-600" />
                    {selectedMonth} 月度报表预览
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    报表生成时间：{formatDate(new Date())}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-4 rounded-xl gradient-card-blue border border-industrial-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-industrial-600/80">巡检总数</span>
                      <ClipboardCheck className="w-4 h-4 text-industrial-600/70" />
                    </div>
                    <div className="text-2xl font-bold text-industrial-800 data-number">
                      {selectedMonthReport.inspectionTotal}
                      <span className="text-sm font-normal ml-1">次</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl gradient-card-green border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-emerald-700/80">完成数</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600/70" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-800 data-number">
                      {selectedMonthReport.inspectionCompleted}
                      <span className="text-sm font-normal ml-1">次</span>
                    </div>
                    <div className="text-xs text-emerald-600/80 mt-1 font-medium">
                      完成率 {Math.round((selectedMonthReport.inspectionCompleted / selectedMonthReport.inspectionTotal) * 100)}%
                    </div>
                  </div>

                  <div className="p-4 rounded-xl gradient-card-amber border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-amber-700/80">隐患总数</span>
                      <AlertTriangle className="w-4 h-4 text-amber-600/70" />
                    </div>
                    <div className="text-2xl font-bold text-amber-800 data-number">
                      {selectedMonthReport.hazardTotal}
                      <span className="text-sm font-normal ml-1">项</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-700/80">已关闭</span>
                      <CheckCircle2 className="w-4 h-4 text-purple-600/70" />
                    </div>
                    <div className="text-2xl font-bold text-purple-800 data-number">
                      {selectedMonthReport.hazardClosed}
                      <span className="text-sm font-normal ml-1">项</span>
                    </div>
                    <div className="text-xs text-purple-600/80 mt-1 font-medium">
                      关闭率 {Math.round((selectedMonthReport.hazardClosed / selectedMonthReport.hazardTotal) * 100)}%
                    </div>
                  </div>

                  <div className="p-4 rounded-xl gradient-card-red border border-fire-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-fire-700/80">演练次数</span>
                      <Flame className="w-4 h-4 text-fire-600/70" />
                    </div>
                    <div className="text-2xl font-bold text-fire-800 data-number">
                      {selectedMonthReport.drillCount}
                      <span className="text-sm font-normal ml-1">次</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600/80">设备检查</span>
                      <Wrench className="w-4 h-4 text-slate-600/70" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 data-number">
                      {selectedMonthReport.deviceCheckCount}
                      <span className="text-sm font-normal ml-1">台</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6 animate-fade-in">
            <div className="card p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="label flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    模块筛选
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {moduleFilters.map((m) => (
                      <button
                        key={m}
                        onClick={() => setModuleFilter(m)}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                          moduleFilter === m
                            ? "bg-industrial-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-w-[160px]">
                  <label className="label">操作人</label>
                  <div className="relative">
                    <select
                      value={operatorFilter}
                      onChange={(e) => setOperatorFilter(e.target.value)}
                      className="input pr-8 appearance-none cursor-pointer"
                    >
                      <option value="全部">全部操作人</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="label">日期范围</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="input !w-[140px]"
                    />
                    <span className="text-slate-400">至</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="input !w-[140px]"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="label">搜索</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="搜索记录名称、操作人、变更字段..."
                      value={changeSearch}
                      onChange={(e) => setChangeSearch(e.target.value)}
                      className="input pl-9"
                    />
                  </div>
                </div>

                <button className="btn-outline">
                  <Download className="w-4 h-4" />
                  导出日志
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="section-title">
                  <ArrowRightLeft className="w-5 h-5 text-industrial-600" />
                  变更日志
                </h3>
                <span className="text-sm text-slate-500">
                  共 <span className="font-semibold text-slate-700 data-number">{filteredChangeLogs.length}</span> 条记录
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr>
                      <th className="table-th whitespace-nowrap">时间</th>
                      <th className="table-th">模块</th>
                      <th className="table-th">记录名称</th>
                      <th className="table-th text-center">操作类型</th>
                      <th className="table-th">变更字段</th>
                      <th className="table-th">变更前</th>
                      <th className="table-th">变更后</th>
                      <th className="table-th">操作人</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChangeLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="table-td text-center py-16 text-slate-400">
                          <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>暂无符合条件的变更记录</p>
                        </td>
                      </tr>
                    ) : (
                      filteredChangeLogs.map((log) => (
                        <tr key={log.id} className="table-row">
                          <td className="table-td whitespace-nowrap font-mono text-xs text-slate-600 data-number">
                            {log.operateTime}
                          </td>
                          <td className="table-td">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                              {log.module}
                            </span>
                          </td>
                          <td className="table-td">
                            <div className="font-medium text-slate-800">{log.recordName}</div>
                            <div className="text-xs text-slate-400 mt-0.5 font-mono">{log.recordId || "—"}</div>
                          </td>
                          <td className="table-td text-center">
                            <span className={actionMap[log.action]?.className || "badge-gray"}>
                              {actionMap[log.action]?.label || log.action}
                            </span>
                          </td>
                          <td className="table-td text-slate-600 text-sm">{log.fieldName || "—"}</td>
                          <td className="table-td">
                            {log.oldValue ? (
                              <span className="text-sm text-fire-700 bg-fire-50 px-2 py-0.5 rounded border border-fire-100">
                                {log.oldValue}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="table-td">
                            {log.newValue ? (
                              <span className="text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 inline-flex">
                                {log.newValue}
                                <ChevronRight className="w-3 h-3 opacity-60" />
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-industrial-100 text-industrial-700 flex items-center justify-center text-xs font-semibold">
                                {log.operatorName.slice(-2)}
                              </div>
                              <span className="text-slate-700 text-sm">{log.operatorName}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "todo" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-l-warning-500">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">待办总数</div>
                    <div className="text-3xl font-bold text-slate-800 data-number">{todos.length}</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-warning-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-fire-600" />
                  <span className="text-slate-600">
                    紧急任务 <span className="font-bold text-fire-600 data-number">{totalUrgent}</span> 项
                  </span>
                </div>
              </div>

              {Object.entries(todoSummary).map(([type, s]) => {
                const Icon = s.icon;
                return (
                  <div key={type} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-slate-500 mb-1">{s.label}</div>
                        <div className="text-3xl font-bold text-slate-800 data-number">{s.count}</div>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center opacity-90`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CircleDot className="w-3.5 h-3.5 text-fire-600" />
                      <span className="text-slate-600">
                        紧急 <span className="font-bold text-fire-600 data-number">{s.urgent}</span> 项
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <h3 className="section-title">
                  <ClipboardCheck className="w-5 h-5 text-industrial-600" />
                  详细待办列表
                </h3>
                <button className="btn-primary">
                  <FileDown className="w-4 h-4" />
                  一键导出提醒清单
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {todos.map((todo, idx) => {
                const typeInfo = todoTypeMap[todo.type];
                const TypeIcon = typeInfo.icon;
                const priorityInfo = priorityMap[todo.priority];
                return (
                  <div
                    key={todo.id}
                    className="card p-4 card-hover animate-stagger-in"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeInfo.color}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-800">{todo.title}</h4>
                              <span
                                className={`badge ${
                                  todo.priority === "high"
                                    ? "badge-red"
                                    : todo.priority === "medium"
                                    ? "badge-orange"
                                    : "badge-green"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.color}`} />
                                {priorityInfo.label}优先级
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <UserCircle2 className="w-3.5 h-3.5" />
                              关联：{todo.relatedName}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                                <Clock className="w-3.5 h-3.5" />
                                截止日期
                              </div>
                              <div
                                className={`text-sm font-semibold data-number ${
                                  new Date(todo.deadline) < new Date("2026-06-10")
                                    ? "text-fire-600"
                                    : "text-slate-700"
                                }`}
                              >
                                {todo.deadline}
                              </div>
                            </div>
                            <button className="btn-outline !px-3 !py-1.5 text-xs">
                              前往处理
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </PageShell>
  );
}
