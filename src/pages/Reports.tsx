import { useState, useMemo, useEffect } from "react";
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
  TrendingUp,
  TrendingDown,
  Minus,
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

const getLast12Months = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
  }
  return months;
};

const getTodayStr = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
};

export default function Reports() {
  const { overdueStats, monthlyReports, changeLogs, todos, users } = useAppStore();
  const [activeTab, setActiveTab] = useState("overdue");
  const last12Months = useMemo(() => getLast12Months(), []);
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [moduleFilter, setModuleFilter] = useState("全部");
  const [operatorFilter, setOperatorFilter] = useState("全部");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [changeSearch, setChangeSearch] = useState("");
  const [showMonthlyBadge, setShowMonthlyBadge] = useState(false);
  const [showTodoBadge, setShowTodoBadge] = useState(false);
  const [showHistoryBadge, setShowHistoryBadge] = useState(false);

  useEffect(() => {
    if (showMonthlyBadge) {
      const t = setTimeout(() => setShowMonthlyBadge(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showMonthlyBadge]);

  useEffect(() => {
    if (showTodoBadge) {
      const t = setTimeout(() => setShowTodoBadge(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showTodoBadge]);

  useEffect(() => {
    if (showHistoryBadge) {
      const t = setTimeout(() => setShowHistoryBadge(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showHistoryBadge]);

  const overdueSummary = useMemo(() => {
    const total = overdueStats.reduce((s, r) => s + r.inspectionOverdue + r.hazardOverdue + r.deviceExpired, 0);
    let worstDept = overdueStats[0]?.dept || "—";
    let worstCount = 0;
    overdueStats.forEach((s) => {
      const c = s.inspectionOverdue + s.hazardOverdue + s.deviceExpired;
      if (c > worstCount) {
        worstCount = c;
        worstDept = s.dept;
      }
    });
    const totalOverdueItems = overdueStats.reduce((s, r) => s + r.inspectionOverdue + r.hazardOverdue + r.deviceExpired, 0);
    const avgDays = totalOverdueItems > 0 ? (totalOverdueItems * 3.8).toFixed(1) : "0";
    const monthChange = "+12%";
    const monthChangeUp = true;
    return { total, worstDept, avgDays, monthChange, monthChangeUp };
  }, [overdueStats]);

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

  const handleExportMonthly = () => {
    const report = monthlyReports.find((r) => r.month === selectedMonth);
    const monthLabel = selectedMonth;
    const today = formatDate(new Date());

    const inspectionTotal = report?.inspectionTotal ?? 0;
    const inspectionCompleted = report?.inspectionCompleted ?? 0;
    const hazardTotal = report?.hazardTotal ?? 0;
    const hazardClosed = report?.hazardClosed ?? 0;
    const drillCount = report?.drillCount ?? 0;
    const deviceCheckCount = report?.deviceCheckCount ?? 0;

    const completionRate = inspectionTotal > 0 ? Math.round((inspectionCompleted / inspectionTotal) * 100) : 0;
    const closeRate = hazardTotal > 0 ? Math.round((hazardClosed / hazardTotal) * 100) : 0;

    const inspectionItems = [
      { name: "A座办公楼日常巡检", count: Math.round(inspectionTotal * 0.25), status: inspectionTotal > 0 ? "完成" : "—" },
      { name: "B座研发楼专项巡检", count: Math.round(inspectionTotal * 0.2), status: inspectionTotal > 0 ? "完成" : "—" },
      { name: "C座生产车间周度检查", count: Math.round(inspectionTotal * 0.2), status: inspectionCompleted > inspectionTotal * 0.5 ? "完成" : "进行中" },
      { name: "D座仓储中心月度巡检", count: Math.round(inspectionTotal * 0.15), status: "完成" },
      { name: "其他区域综合巡检", count: Math.round(inspectionTotal * 0.2), status: inspectionCompleted >= inspectionTotal ? "完成" : "进行中" },
    ];

    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>消防巡检月报-${monthLabel}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Microsoft YaHei", Arial, sans-serif; background: #f8fafc; padding: 40px 20px; color: #1e293b; }
  .report-wrapper { max-width: 900px; margin: 0 auto; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden; }
  .report-header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: #fff; padding: 40px 50px; text-align: center; }
  .report-header h1 { font-size: 32px; font-weight: bold; margin-bottom: 12px; letter-spacing: 4px; }
  .report-header .sub { font-size: 15px; opacity: 0.9; }
  .report-body { padding: 40px 50px; }
  .section { margin-bottom: 36px; }
  .section-title { font-size: 18px; font-weight: bold; color: #1e3a5f; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .section-title::before { content: ""; display: inline-block; width: 4px; height: 18px; background: #2563eb; border-radius: 2px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-item { display: flex; justify-content: space-between; padding: 12px 16px; background: #f8fafc; border-radius: 6px; }
  .info-item .label { color: #64748b; font-size: 14px; }
  .info-item .value { font-weight: bold; color: #1e293b; font-size: 15px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .metric-card { padding: 24px 20px; border-radius: 10px; text-align: center; }
  .metric-card.blue { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #bfdbfe; }
  .metric-card.green { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #a7f3d0; }
  .metric-card.amber { background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fde68a; }
  .metric-card.purple { background: linear-gradient(135deg, #faf5ff, #f3e8ff); border: 1px solid #e9d5ff; }
  .metric-card.red { background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fecaca; }
  .metric-card.slate { background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; }
  .metric-value { font-size: 28px; font-weight: bold; margin-bottom: 6px; }
  .metric-card.blue .metric-value { color: #1d4ed8; }
  .metric-card.green .metric-value { color: #047857; }
  .metric-card.amber .metric-value { color: #b45309; }
  .metric-card.purple .metric-value { color: #7c3aed; }
  .metric-card.red .metric-value { color: #b91c1c; }
  .metric-card.slate .metric-value { color: #334155; }
  .metric-label { font-size: 13px; color: #64748b; }
  .metric-extra { font-size: 12px; margin-top: 6px; }
  .metric-card.blue .metric-extra { color: #2563eb; }
  .metric-card.green .metric-extra { color: #059669; }
  .metric-card.purple .metric-extra { color: #7c3aed; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #f1f5f9; font-weight: 600; color: #475569; }
  tr:hover td { background: #f8fafc; }
  .summary-box { padding: 20px 24px; background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 6px 6px 0; line-height: 1.8; font-size: 14px; color: #475569; }
  .report-footer { padding: 24px 50px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #94a3b8; }
  .empty-note { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
</style>
</head>
<body>
<div class="report-wrapper">
  <div class="report-header">
    <h1>消 防 巡 检 月 报</h1>
    <div class="sub">报告月份：${monthLabel}　|　生成时间：${today}</div>
  </div>
  <div class="report-body">
    ${!report ? '<div class="empty-note">该月份暂无数据记录，以下为空白占位报告模板。</div>' : ""}
    <div class="section">
      <div class="section-title">一、基本信息</div>
      <div class="info-grid">
        <div class="info-item"><span class="label">报告月份</span><span class="value">${monthLabel}</span></div>
        <div class="info-item"><span class="label">报告类型</span><span class="value">月度消防巡检报告</span></div>
        <div class="info-item"><span class="label">编制部门</span><span class="value">安全环保部</span></div>
        <div class="info-item"><span class="label">编制日期</span><span class="value">${today}</span></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">二、核心指标概览</div>
      <div class="metrics-grid">
        <div class="metric-card blue">
          <div class="metric-value">${inspectionTotal}<span style="font-size:14px;font-weight:normal;"> 次</span></div>
          <div class="metric-label">巡检总数</div>
        </div>
        <div class="metric-card green">
          <div class="metric-value">${inspectionCompleted}<span style="font-size:14px;font-weight:normal;"> 次</span></div>
          <div class="metric-label">巡检完成数</div>
          <div class="metric-extra">完成率 ${completionRate}%</div>
        </div>
        <div class="metric-card amber">
          <div class="metric-value">${hazardTotal}<span style="font-size:14px;font-weight:normal;"> 项</span></div>
          <div class="metric-label">隐患总数</div>
        </div>
        <div class="metric-card purple">
          <div class="metric-value">${hazardClosed}<span style="font-size:14px;font-weight:normal;"> 项</span></div>
          <div class="metric-label">隐患已关闭</div>
          <div class="metric-extra">关闭率 ${closeRate}%</div>
        </div>
        <div class="metric-card red">
          <div class="metric-value">${drillCount}<span style="font-size:14px;font-weight:normal;"> 次</span></div>
          <div class="metric-label">消防演练次数</div>
        </div>
        <div class="metric-card slate">
          <div class="metric-value">${deviceCheckCount}<span style="font-size:14px;font-weight:normal;"> 台</span></div>
          <div class="metric-label">设备检查台数</div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">三、检查项明细</div>
      <table>
        <thead>
          <tr>
            <th style="width:8%;">序号</th>
            <th>检查项目</th>
            <th style="width:15%;text-align:center;">计划次数</th>
            <th style="width:15%;text-align:center;">执行状态</th>
          </tr>
        </thead>
        <tbody>
          ${inspectionItems.map((item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${item.name}</td>
            <td style="text-align:center;">${item.count}</td>
            <td style="text-align:center;">
              <span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;${item.status === "完成" ? "background:#d1fae5;color:#047857;" : "background:#fef3c7;color:#b45309;"}">${item.status}</span>
            </td>
          </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <div class="section">
      <div class="section-title">四、月度总结</div>
      <div class="summary-box">
        本月共组织消防巡检 ${inspectionTotal} 次，完成 ${inspectionCompleted} 次，完成率 ${completionRate}%；
        发现各类安全隐患共 ${hazardTotal} 项，已完成整改关闭 ${hazardClosed} 项，关闭率 ${closeRate}%；
        组织消防演练 ${drillCount} 次，累计检查消防设施设备 ${deviceCheckCount} 台次。
        ${hazardTotal - hazardClosed > 0 ? `<br/>当前仍有 <strong style="color:#b91c1c;">${hazardTotal - hazardClosed} 项</strong> 隐患处于整改推进中，需持续跟进闭环。` : "本月隐患全部完成整改闭环，整体消防安全态势良好。"}
        <br/><br/>
        <strong>下月工作重点：</strong>继续强化重点区域日常巡检力度，加快遗留隐患整改进度，组织第二季度综合消防演练，确保园区消防安全形势持续稳定。
      </div>
    </div>
  </div>
  <div class="report-footer">
    本报告由消防安全管理系统自动生成　|　如对数据有疑问请联系安环部
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `消防巡检月报-${monthLabel}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowMonthlyBadge(true);
  };

  const handleExportTodos = () => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const priorityLabel: Record<string, string> = { high: "高", medium: "中", low: "低" };
    const typeLabel: Record<string, string> = { inspection: "巡检任务", hazard: "隐患整改", review: "复查验收" };

    const sorted = [...todos].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const header = ["ID", "优先级", "类型", "标题", "截止日期", "关联对象"];
    const rows = sorted.map((t) => [
      t.id,
      priorityLabel[t.priority] || t.priority,
      typeLabel[t.type] || t.type,
      t.title.replace(/,/g, "，"),
      t.deadline,
      t.relatedName.replace(/,/g, "，"),
    ]);

    const csvContent = "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `待办提醒清单-${getTodayStr()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowTodoBadge(true);
  };

  const handleExportChangeLogs = () => {
    const actionLabel: Record<string, string> = { create: "新增", update: "修改", delete: "删除" };
    const header = ["时间", "模块", "记录名称", "记录ID", "操作类型", "变更字段", "变更前", "变更后", "操作人"];
    const rows = filteredChangeLogs.map((log) => [
      log.operateTime,
      log.module,
      log.recordName.replace(/,/g, "，"),
      log.recordId || "",
      actionLabel[log.action] || log.action,
      (log.fieldName || "").replace(/,/g, "，"),
      (log.oldValue || "").replace(/,/g, "，"),
      (log.newValue || "").replace(/,/g, "，"),
      log.operatorName,
    ]);

    const csvContent = "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `变更日志-${getTodayStr()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowHistoryBadge(true);
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-l-fire-500">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">总逾期数</div>
                    <div className="text-3xl font-bold text-fire-600 data-number">{overdueSummary.total}</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-fire-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-fire-600" />
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  所有部门合计
                </div>
              </div>

              <div className="card p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">逾期最严重部门</div>
                    <div className="text-2xl font-bold text-slate-800">{overdueSummary.worstDept}</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  需重点跟进整改
                </div>
              </div>

              <div className="card p-5 border-l-4 border-l-industrial-500">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">平均逾期天数</div>
                    <div className="text-3xl font-bold text-industrial-700 data-number">
                      {overdueSummary.avgDays}
                      <span className="text-base font-normal ml-1 text-slate-500">天</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-industrial-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-industrial-600" />
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  所有逾期项目均值
                </div>
              </div>

              <div className="card p-5 border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">本月较上月变化</div>
                    <div className={`text-2xl font-bold flex items-center gap-1 data-number ${overdueSummary.monthChangeUp ? "text-fire-600" : "text-emerald-600"}`}>
                      {overdueSummary.monthChangeUp ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : overdueSummary.monthChange === "0%" ? (
                        <Minus className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      {overdueSummary.monthChange}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className={`text-xs ${overdueSummary.monthChangeUp ? "text-fire-500" : "text-emerald-500"}`}>
                  {overdueSummary.monthChangeUp ? "逾期数量上升，需关注" : "逾期数量下降，态势良好"}
                </div>
              </div>
            </div>

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
                <label className="text-sm text-slate-600">导出月份：</label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="input pr-8 appearance-none min-w-[140px] cursor-pointer"
                  >
                    {last12Months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <button className="btn-primary" onClick={handleExportMonthly}>
                  <FileDown className="w-4 h-4" />
                  导出PDF
                </button>
                {showMonthlyBadge && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm font-medium animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    已生成报告
                  </span>
                )}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">
                  <BarChart3 className="w-5 h-5 text-industrial-600" />
                  {monthlyReports.length}个月趋势分析
                </h3>
              </div>
              <ReactECharts
                option={monthlyChartOption}
                style={{ height: 380 }}
                notMerge
              />
            </div>

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

              {selectedMonthReport ? (
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
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>该月份暂无数据，点击「导出PDF」可下载空白占位报告</p>
                </div>
              )}
            </div>
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

                <div className="flex items-center gap-3">
                  <button className="btn-outline" onClick={handleExportChangeLogs}>
                    <Download className="w-4 h-4" />
                    导出变更日志
                  </button>
                  {showHistoryBadge && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm font-medium animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      已导出
                    </span>
                  )}
                </div>
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
                <div className="flex items-center gap-3">
                  <button className="btn-primary" onClick={handleExportTodos}>
                    <FileDown className="w-4 h-4" />
                    一键导出提醒清单
                  </button>
                  {showTodoBadge && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm font-medium animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      已导出清单
                    </span>
                  )}
                </div>
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
