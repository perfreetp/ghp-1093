import { Router } from "express";
import { mockDrills, mockDrillAttendees } from "../mockData";
import type { DrillAttendee } from "../../src/types";

const router = Router();
let drills = [...mockDrills];
let attendees: DrillAttendee[] = [...mockDrillAttendees];

router.get("/", (req, res) => {
  const { status, type, keyword } = req.query;
  let list = [...drills];
  if (status && status !== "all") list = list.filter((d) => d.status === status);
  if (type && type !== "all") list = list.filter((d) => d.type === type);
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    list = list.filter((d) => d.title.toLowerCase().includes(kw) || d.location.toLowerCase().includes(kw));
  }
  res.json({ code: 0, message: "ok", data: { list, total: list.length }, timestamp: Date.now() });
});

router.get("/:id", (req, res) => {
  const d = drills.find((x) => x.id === req.params.id);
  const att = attendees.filter((a) => a.drillId === req.params.id);
  res.json({ code: d ? 0 : 404, message: d ? "ok" : "not found", data: d ? { ...d, attendees: att } : null, timestamp: Date.now() });
});

router.post("/", (req, res) => {
  const newItem = { id: `dr${Date.now()}`, signedCount: 0, photos: [], evaluation: "", status: "planned" as const, ...req.body };
  drills = [newItem, ...drills];
  res.json({ code: 0, message: "ok", data: newItem, timestamp: Date.now() });
});

router.put("/:id", (req, res) => {
  drills = drills.map((d) => (d.id === req.params.id ? { ...d, ...req.body } : d));
  const updated = drills.find((d) => d.id === req.params.id);
  res.json({ code: 0, message: "ok", data: updated, timestamp: Date.now() });
});

router.post("/:id/sign", (req, res) => {
  const newAtt: DrillAttendee = { id: `da${Date.now()}`, drillId: req.params.id, ...req.body, signTime: new Date().toISOString().slice(0, 16).replace("T", " ") };
  attendees = [...attendees, newAtt];
  drills = drills.map((d) => d.id === req.params.id ? { ...d, signedCount: d.signedCount + 1 } : d);
  res.json({ code: 0, message: "签到成功", data: newAtt, timestamp: Date.now() });
});

export default router;
