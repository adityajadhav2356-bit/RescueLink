import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import WorkerDashboard from './pages/WorkerDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';

function App() {
  const [user, setUser] = useState(null); // { id: 'w123', role: 'worker' | 'supervisor' }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setUser={setUser} />} />

        {/* Protected Routes */}
        <Route
          path="/worker"
          element={user?.role === 'worker' ? <WorkerDashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/supervisor"
          element={user?.role === 'supervisor' ? <SupervisorDashboard user={user} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
