import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Doctor from "./pages/Doctor";
import LabTechnician from "./pages/LabTechnician";

import PharmacyDashboard from "./pages/pharmacist/PharmacyDashboard";
import MedicineStock from "./pages/pharmacist/MedicineStock";
import PrescriptionList from "./pages/pharmacist/PrescriptionList";
import PrescriptionDetails from "./pages/pharmacist/PrescriptionDetails";
import DispenseMedicine from "./pages/pharmacist/DispenseMedicine";
import PharmacyBill from "./pages/pharmacist/PharmacyBill";
import SalesReports from "./pages/pharmacist/SalesReports";
import PharmacyBillPrint from "./pages/pharmacist/PharmacyBillPrint";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Default / Admin
        ========================== */}
        <Route path="/" element={<Admin />} />
        <Route path="/admin" element={<Admin />} />

        {/* =========================
            Doctor
        ========================== */}
        <Route path="/doctor" element={<Doctor />} />

        {/* =========================
            Lab Technician
        ========================== */}
        <Route
          path="/lab-technician"
          element={<LabTechnician />}
        />

        {/* =========================
            Login
        ========================== */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* =========================
            PHARMACIST
        ========================== */}

        {/* Pharmacist Dashboard */}
        <Route
          path="/pharmacist"
          element={<PharmacyDashboard />}
        />

        <Route
          path="/pharmacist/dashboard"
          element={<PharmacyDashboard />}
        />

        {/* Medicine Stock */}
        <Route
          path="/pharmacist/medicines"
          element={<MedicineStock />}
        />

        {/* Prescription Management */}
        <Route
          path="/pharmacist/prescriptions"
          element={<PrescriptionList />}
        />

        {/* Prescription Details */}
        <Route
          path="/pharmacist/prescriptions/:id"
          element={<PrescriptionDetails />}
        />

        {/* Dispense Medicine */}
        <Route
          path="/pharmacist/dispense/:id"
          element={<DispenseMedicine />}
        />

        {/* Pharmacy Bill */}
        <Route
          path="/pharmacist/bills/:id"
          element={<PharmacyBill />}
        />

        {/* Printable Pharmacy Bill */}
        <Route
          path="/pharmacist/bills/:id/print"
          element={<PharmacyBillPrint />}
        />

        {/* Sales Reports */}
        <Route
          path="/pharmacist/reports"
          element={<SalesReports />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;