import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Pill,
  FlaskConical,
  Printer,
  Download,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building,
} from "lucide-react";
import reportService from "../../services/reportService";

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await reportService.generateComprehensiveReport();
      setReportData(data);
    } catch (err) {
      console.error("Error generating admin reports:", err);
      setAlertMsg({ type: "danger", text: "Failed to compile financial and operational analytics." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-xs rounded-3 bg-white p-5 text-center">
        <RefreshCw size={32} className="spin mb-3 text-primary mx-auto" />
        <h6 className="fw-bold text-slate-800">Generating Executive Analytics & Reports...</h6>
        <p className="text-muted small">Aggregating consultation receipts, pharmacy dispensary ledgers, and pathology billing.</p>
      </div>
    );
  }

  const stats = reportData?.statistics || {};
  const staff = reportData?.staff || {};
  const rawStaff = reportData?.raw?.staff || [];
  const rawMedicines = reportData?.raw?.medicines || [];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header with Export & Print */}
      <div className="card border-0 shadow-xs rounded-3 bg-white p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="fw-bold mb-0 text-slate-900">Hospital Financial & Operations Reports</h4>
            <small className="text-muted">
              Executive multi-speciality revenue analytics, clinical department volume, and operational summaries
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={loadData}
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button
              className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3"
              onClick={handlePrint}
            >
              <Printer size={15} />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Financial Revenue Cards */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Doctor Consultation</span>
                <h3 className="fw-bold mt-1 mb-0 text-slate-900">₹{stats.consultation_revenue?.toLocaleString()}</h3>
                <small className="text-muted">OPD doctor fees billed</small>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <Stethoscope size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Pharmacy Billing</span>
                <h3 className="fw-bold mt-1 mb-0 text-slate-900">₹{stats.pharmacy_billing?.toLocaleString()}</h3>
                <small className="text-muted">Medication dispensing sales</small>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Pill size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Laboratory Billing</span>
                <h3 className="fw-bold mt-1 mb-0 text-slate-900">₹{stats.laboratory_billing?.toLocaleString()}</h3>
                <small className="text-muted">Diagnostic lab test fees</small>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <FlaskConical size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-purple bg-gradient">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Hospital Revenue</span>
                <h3 className="fw-bold mt-1 mb-0 text-slate-900">₹{stats.total_revenue?.toLocaleString()}</h3>
                <small className="text-emerald-600 fw-medium">All revenue streams combined</small>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Flow & Clinical Volume Analytics */}
      <div className="row g-4">
        {/* Patient Volume Breakdown */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
            <div className="card-header bg-white border-0 py-3 px-4">
              <h6 className="fw-bold mb-0 text-slate-900">Patient Volume & Appointment Status</h6>
              <small className="text-muted">Patient lifecycle flow breakdown</small>
            </div>
            <div className="card-body px-4 pt-1">
              <div className="d-flex flex-column gap-3">
                <div className="p-3 bg-slate-50 rounded-3 border d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary p-2 rounded-circle"> </span>
                    <div>
                      <strong className="text-slate-800 d-block">Incoming Patients</strong>
                      <small className="text-muted">Newly registered & in waiting queue</small>
                    </div>
                  </div>
                  <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                    {stats.incoming_patients} Patients
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-3 border d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success p-2 rounded-circle"> </span>
                    <div>
                      <strong className="text-slate-800 d-block">Completed Consultations</strong>
                      <small className="text-muted">Examined and prescribed</small>
                    </div>
                  </div>
                  <span className="badge bg-success fs-6 px-3 py-2 rounded-pill">
                    {stats.completed_patients} Patients
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-3 border d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning p-2 rounded-circle"> </span>
                    <div>
                      <strong className="text-slate-800 d-block">Pending Appointments</strong>
                      <small className="text-muted">Awaiting doctor attention / lab test results</small>
                    </div>
                  </div>
                  <span className="badge bg-warning text-dark fs-6 px-3 py-2 rounded-pill">
                    {stats.pending_appointments} Patients
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-3 border d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-danger p-2 rounded-circle"> </span>
                    <div>
                      <strong className="text-slate-800 d-block">Cancelled Appointments</strong>
                      <small className="text-muted">No-shows or revoked bookings</small>
                    </div>
                  </div>
                  <span className="badge bg-danger fs-6 px-3 py-2 rounded-pill">
                    {stats.cancelled_patients} Patients
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Revenue Contribution Breakdown */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
            <div className="card-header bg-white border-0 py-3 px-4">
              <h6 className="fw-bold mb-0 text-slate-900">Doctor Consultation Revenue Breakdown</h6>
              <small className="text-muted">Consultation fees collected by physician</small>
            </div>
            <div className="card-body px-4 pt-1">
              <div className="table-responsive rounded-2 border">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light text-slate-600">
                    <tr>
                      <th className="px-3">Doctor Name</th>
                      <th>Department</th>
                      <th>Fee (₹)</th>
                      <th className="text-end px-3">Est. Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawStaff
                      .filter((s) => s.role === "DOCTOR")
                      .map((doc, idx) => {
                        const fee = parseFloat(doc.consultation_fee) || 500;
                        const patientCount = Math.max(1, Math.round((stats.completed_patients || 4) / (rawStaff.filter((s) => s.role === "DOCTOR").length || 1)));
                        const total = fee * patientCount;
                        return (
                          <tr key={doc.id || doc.staff_id}>
                            <td className="px-3">
                              <strong className="text-slate-900">Dr. {doc.first_name} {doc.last_name}</strong>
                              <div className="text-muted font-monospace" style={{ fontSize: "10px" }}>{doc.staff_id}</div>
                            </td>
                            <td>{doc.department_name || "General Medicine"}</td>
                            <td>₹{fee}</td>
                            <td className="text-end px-3">
                              <strong className="text-success">₹{total.toLocaleString()}</strong>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
