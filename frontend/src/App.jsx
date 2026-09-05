import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Doctor from "./pages/Doctor";
import LabDashboard from "./pages/lab/LabDashboard";
import PharmacyDashboard from "./pages/pharmacist/PharmacyDashboard";
import MedicineStock from "./pages/pharmacist/MedicineStock";
import PrescriptionList from "./pages/pharmacist/PrescriptionList";
import PrescriptionDetails from "./pages/pharmacist/PrescriptionDetails";
import DispenseMedicine from "./pages/pharmacist/DispenseMedicine";
import PharmacyBill from "./pages/pharmacist/PharmacyBill";
import PharmacyBillPrint from "./pages/pharmacist/PharmacyBillPrint";
import SalesReports from "./pages/pharmacist/SalesReports";
import PharmacistLayout from "./pages/pharmacist/PharmacistLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const RootRedirect = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  if (!user || !token) return <Navigate to="/login" replace />;

  const role = (user.role || "").toUpperCase().replace("-", "_");
  if (role === "ADMIN" || role === "ADMINISTRATOR") return <Navigate to="/admin" replace />;
  if (["LAB_TECHNICIAN", "LAB_TECH", "LAB", "LABTECHNICIAN"].includes(role)) return <Navigate to="/lab-technician" replace />;
  if (role === "DOCTOR") return <Navigate to="/doctor" replace />;
  if (role === "PHARMACIST") return <Navigate to="/pharmacist" replace />;
  return <Navigate to="/admin" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><Doctor /></ProtectedRoute>} />
        <Route path="/lab-technician" element={<ProtectedRoute allowedRoles={["LAB_TECHNICIAN", "LAB"]}><LabDashboard /></ProtectedRoute>} />
        <Route path="/lab" element={<ProtectedRoute allowedRoles={["LAB_TECHNICIAN", "LAB"]}><LabDashboard /></ProtectedRoute>} />
        <Route element={<ProtectedRoute allowedRoles={["PHARMACIST"]}><PharmacistLayout /></ProtectedRoute>}>
          <Route path="/pharmacist" element={<PharmacyDashboard />} />
          <Route path="/pharmacist/dashboard" element={<PharmacyDashboard />} />
          <Route path="/pharmacist/medicines" element={<MedicineStock />} />
          <Route path="/pharmacist/prescriptions" element={<PrescriptionList />} />
          <Route path="/pharmacist/prescriptions/:id" element={<PrescriptionDetails />} />
          <Route path="/pharmacist/dispense/:id" element={<DispenseMedicine />} />
          <Route path="/pharmacist/bills/:id" element={<PharmacyBill />} />
          <Route path="/pharmacist/bills/:id/print" element={<PharmacyBillPrint />} />
          <Route path="/pharmacist/reports" element={<SalesReports />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
