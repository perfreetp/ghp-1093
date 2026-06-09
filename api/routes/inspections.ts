import { Router } from "express";
import { mockInspections, mockInspectionPoints } from "../mockData";

const router = Router();
let inspections = [...mockInspections];

router.get("/", (req, res) => {
  const { status, inspectorId, type } = req.query;
  let list = [...inspections];
  if (status && status !== "all") list = list.filter((i) => i.status === status);
  if (inspectorId && inspectorId !== "all") list = list.filter((i) => i.inspectorId === inspectorId);
  if (type && type !== "all") list = list.filter((i) => i.type === type);
  res.json({ code: 0, message: "ok", data: { list, total: list.length }, timestamp: Date.now() });
});

router.get("/points", (_req, res) => {
  res.json({ code: 0, message: "ok", data: mockInspectionPoints, timestamp: Date.now() });
});

router.get("/:id", (req, res) => {
  const insp = inspections.find((i) => i.id === req.params.id);
  const points = mockInspectionPoints.filter((p) => insp?.pointIds.includes(p.id));
  res.json({ code: insp ? 0 : 404, message: insp ? "ok" : "not found", data: insp ? { ...insp, points } : null, timestamp: Date.now() });
});

router.post("/", (req, res) => {
  const newItem = { id: `i${Date.now()}`, progress: 0, status: "pending" as const, ...req.body };
  inspections = [newItem, ...inspections];
  res.json({ code: 0, message: "ok", data: newItem, timestamp: Date.now() });
});

router.put("/:id", (req, res) => {
  inspections = inspections.map((i) => (i.id === req.params.id ? { ...i, ...req.body } : i));
  const updated = inspections.find((i) => i.id === req.params.id);
  res.json({ code: 0, message: "ok", data: updated, timestamp: Date.now() });
});

router.post("/:id/records", (req, res) => {
  res.json({ code: 0, message: "record saved", data: { id: `r${Date.now()}`, ...req.body }, timestamp: Date.now() });
});

export default router;
