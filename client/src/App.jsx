import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import SafetyAnalytics from "./pages/SafetyAnalytics";

function App() {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Landing />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Supervisor / Command Center */}
      <Route path="/supervisor" element={<SupervisorDashboard />} />

      {/* Worker mobile dashboard */}
      <Route path="/worker" element={<WorkerDashboard />} />

      {/* Analytics */}
      <Route path="/analytics" element={<SafetyAnalytics />} />

      {/* Unknown URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;