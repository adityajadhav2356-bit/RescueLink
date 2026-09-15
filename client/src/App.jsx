import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import WorkerDashboard from './pages/WorkerDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';

function App() {
  const [user, setUser] = useState({ id: 'W-042', name: 'Alex Mercer', role: 'supervisor' });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setUser={setUser} />} />

        {/* Dedicated Portals */}
        <Route path="/worker" element={<WorkerDashboard user={user} />} />
        <Route path="/supervisor" element={<SupervisorDashboard user={user} />} />

        {/* Fallbacks */}
        <Route path="*" element={<Navigate to="/supervisor" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
