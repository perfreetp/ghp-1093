import { Router } from "express";
import { mockHazards } from "../mockData";

const router = Router();
let hazards = [...mockHazards];

router.get("/", (req, res) => {
  const { level, status, buildingId, keyword } = req.query;
  let list = [...hazards];
  if (level && level !== "all") list = list.filter((h) => h.level === level);
  if (status && status !== "all") list = list.filter((h) => h.status === status);
  if (buildingId) list = list.filter((h) => h.buildingId === buildingId);
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    list = list.filter((h) => h.title.toLowerCase().includes(kw) || h.description.toLowerCase().includes(kw));
  }
  res.json({ code: 0, message: "ok", data: { list, total: list.length }, timestamp: Date.now() });
});

router.get("/:id", (req, res) => {
  const h = hazards.find((x) => x.id === req.params.id);
  res.json({ code: h ? 0 : 404, message: h ? "ok" : "not found", data: h ?? null, timestamp: Date.now() });
});

router.post("/", (req, res) => {
  const newItem = { id: `h${Date.now()}`, history: [{ status: "已登记", time: new Date().toISOString().slice(0, 16).replace("T", " "), operator: req.body.reporterName || "系统" }], ...req.body };
  hazards = [newItem, ...hazards];
  res.json({ code: 0, message: "ok", data: newItem, timestamp: Date.now() });
});

router.put("/:id", (req, res) => {
  hazards = hazards.map((h) => (h.id === req.params.id ? { ...h, ...req.body } : h));
  const updated = hazards.find((h) => h.id === req.params.id);
  res.json({ code: 0, message: "ok", data: updated, timestamp: Date.now() });
});

export default router;
