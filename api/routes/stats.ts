import { Router } from "express";
import type { ApiResponse } from "../../shared/types";
import {
  mockOverviewStats,
  mockOverdueStats,
  mockMonthlyReports,
  mockChangeLogs,
} from "../mockData";

const router = Router();

router.get("/overview", (_req, res) => {
  const response: ApiResponse<typeof mockOverviewStats> = {
    code: 0,
    message: "ok",
    data: mockOverviewStats,
    timestamp: Date.now(),
  };
  res.json(response);
});

router.get("/overdue", (_req, res) => {
  const response: ApiResponse<typeof mockOverdueStats> = {
    code: 0,
    message: "ok",
    data: mockOverdueStats,
    timestamp: Date.now(),
  };
  res.json(response);
});

router.get("/monthly", (_req, res) => {
  const response: ApiResponse<typeof mockMonthlyReports> = {
    code: 0,
    message: "ok",
    data: mockMonthlyReports,
    timestamp: Date.now(),
  };
  res.json(response);
});

router.get("/changelogs", (_req, res) => {
  const { module, operator, page = 1, pageSize = 20 } = _req.query;
  let list = [...mockChangeLogs];
  if (module && module !== "all") {
    list = list.filter((l) => l.module === module);
  }
  if (operator) {
    list = list.filter((l) => l.operatorName.includes(String(operator)));
  }
  const start = (Number(page) - 1) * Number(pageSize);
  const paged = list.slice(start, start + Number(pageSize));
  res.json({
    code: 0,
    message: "ok",
    data: { list: paged, total: list.length, page: Number(page), pageSize: Number(pageSize) },
    timestamp: Date.now(),
  });
});

export default router;
