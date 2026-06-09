import { Router } from "express";
import { mockDevices } from "../mockData";

const router = Router();
let devices = [...mockDevices];

router.get("/", (req, res) => {
  const { type, status, buildingId, keyword } = req.query;
  let list = [...devices];
  if (type && type !== "all") {
    list = list.filter((d) => d.type === type);
  }
  if (status && status !== "all") {
    list = list.filter((d) => d.status === status);
  }
  if (buildingId) {
    list = list.filter((d) => d.buildingId === buildingId);
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    list = list.filter((d) => d.location.toLowerCase().includes(kw) || d.model.toLowerCase().includes(kw) || d.serialNumber.toLowerCase().includes(kw));
  }
  res.json({ code: 0, message: "ok", data: { list, total: list.length }, timestamp: Date.now() });
});

router.get("/:id", (req, res) => {
  const device = devices.find((d) => d.id === req.params.id);
  res.json({ code: device ? 0 : 404, message: device ? "ok" : "not found", data: device ?? null, timestamp: Date.now() });
});

router.post("/", (req, res) => {
  const newDevice = { id: `d${Date.now()}`, ...req.body };
  devices = [newDevice, ...devices];
  res.json({ code: 0, message: "ok", data: newDevice, timestamp: Date.now() });
});

router.put("/:id", (req, res) => {
  devices = devices.map((d) => (d.id === req.params.id ? { ...d, ...req.body } : d));
  const updated = devices.find((d) => d.id === req.params.id);
  res.json({ code: 0, message: "ok", data: updated, timestamp: Date.now() });
});

router.post("/check-cycle", (req, res) => {
  const { type, cycle } = req.body;
  devices = devices.map((d) => (d.type === type ? { ...d, checkCycle: cycle } : d));
  res.json({ code: 0, message: "ok", timestamp: Date.now() });
});

export default router;
