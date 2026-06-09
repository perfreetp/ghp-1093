import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import BuildingList from "@/pages/BuildingList";
import DeviceList from "@/pages/DeviceList";
import InspectionList from "@/pages/InspectionList";
import HazardList from "@/pages/HazardList";
import DrillList from "@/pages/DrillList";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buildings" element={<BuildingList />} />
          <Route path="/devices" element={<DeviceList />} />
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/hazards" element={<HazardList />} />
          <Route path="/drills" element={<DrillList />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
