import { Router } from "express";
import type { ApiResponse } from "../../shared/types";
import { mockBuildings } from "../mockData";

const router = Router();
let buildings = [...mockBuildings];

router.get("/", (req, res) => {
  const { keyword, riskLevel, page = 1, pageSize = 20 } = req.query;
  let list = [...buildings];
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    list = list.filter((b) => b.name.toLowerCase().includes(kw) || b.address.toLowerCase().includes(kw));
  }
  if (riskLevel && riskLevel !== "all") {
    list = list.filter((b) => b.riskLevel === riskLevel);
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

router.get("/:id", (req, res) => {
  const building = buildings.find((b) => b.id === req.params.id);
  const response: ApiResponse<typeof building | null> = {
    code: building ? 0 : 404,
    message: building ? "ok" : "not found",
    data: building ?? null,
    timestamp: Date.now(),
  };
  res.json(response);
});

router.post("/", (req, res) => {
  const newBuilding = { id: `b${Date.now()}`, ...req.body, createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) };
  buildings = [newBuilding, ...buildings];
  res.json({ code: 0, message: "ok", data: newBuilding, timestamp: Date.now() });
});

router.put("/:id", (req, res) => {
  buildings = buildings.map((b) => (b.id === req.params.id ? { ...b, ...req.body, updatedAt: new Date().toISOString().slice(0, 10) } : b));
  const updated = buildings.find((b) => b.id === req.params.id);
  res.json({ code: 0, message: "ok", data: updated, timestamp: Date.now() });
});

router.delete("/:id", (req, res) => {
  buildings = buildings.filter((b) => b.id !== req.params.id);
  res.json({ code: 0, message: "ok", timestamp: Date.now() });
});

export default router;
