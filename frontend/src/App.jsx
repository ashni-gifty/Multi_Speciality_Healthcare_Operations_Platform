import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Doctor from "./pages/Doctor";
import LabTechnician from "./pages/LabTechnician";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default / Admin Dashboard */}
        <Route path="/" element={<Admin />} />
        <Route path="/admin" element={<Admin />} />

        {/* Doctor Dashboard */}
        <Route path="/doctor" element={<Doctor />} />

        {/* Lab Technician Dashboard */}
        <Route path="/lab-technician" element={<LabTechnician />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;