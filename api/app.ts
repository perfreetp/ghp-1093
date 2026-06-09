import express, { type Request, type Response } from "express";
import cors from "cors";
import auth from "./routes/auth";
import buildings from "./routes/buildings";
import devices from "./routes/devices";
import inspections from "./routes/inspections";
import hazards from "./routes/hazards";
import drills from "./routes/drills";
import stats from "./routes/stats";
import reports from "./routes/reports";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", code: 0, timestamp: Date.now(), service: "消防巡检管理平台 API" });
});

app.use("/api/auth", auth);
app.use("/api/buildings", buildings);
app.use("/api/devices", devices);
app.use("/api/inspections", inspections);
app.use("/api/hazards", hazards);
app.use("/api/drills", drills);
app.use("/api/stats", stats);
app.use("/api/reports", reports);

app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: err.message || "Internal Server Error" });
});

export default app;
