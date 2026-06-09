import { Router } from "express";
import { mockMonthlyReports, mockTodos } from "../mockData";

const router = Router();

router.get("/monthly/export", (req, res) => {
  const { month } = req.query;
  const data = month ? mockMonthlyReports.filter((r) => r.month === month) : mockMonthlyReports;
  const total = data.reduce((acc, r) => ({
    inspectionTotal: acc.inspectionTotal + r.inspectionTotal,
    inspectionCompleted: acc.inspectionCompleted + r.inspectionCompleted,
    hazardTotal: acc.hazardTotal + r.hazardTotal,
    hazardClosed: acc.hazardClosed + r.hazardClosed,
    drillCount: acc.drillCount + r.drillCount,
    deviceCheckCount: acc.deviceCheckCount + r.deviceCheckCount,
  }), { inspectionTotal: 0, inspectionCompleted: 0, hazardTotal: 0, hazardClosed: 0, drillCount: 0, deviceCheckCount: 0 });
  res.json({
    code: 0,
    message: "导出成功（模拟）",
    data: { url: "/reports/mock-export.pdf", month, records: data, total },
    timestamp: Date.now(),
  });
});

router.get("/todos/export", (_req, res) => {
  res.json({
    code: 0,
    message: "导出成功（模拟）",
    data: { url: "/reports/todos.xlsx", count: mockTodos.length, items: mockTodos },
    timestamp: Date.now(),
  });
});

export default router;
