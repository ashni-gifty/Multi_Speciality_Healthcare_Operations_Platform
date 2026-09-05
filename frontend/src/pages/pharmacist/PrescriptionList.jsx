import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Pill,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  RefreshCw,
  X,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import pharmacyService from "../../services/pharmacyService";

const PrescriptionList = () => {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedRxDetail, setSelectedRxDetail] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rxData, billsData] = await Promise.all([
        pharmacyService.getPrescriptions(),
        pharmacyService.getBills(),
      ]);
      setPrescriptions(rxData);
      setBills(billsData);
    } catch (err) {
      console.error("Error loading prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dispensedRxIds = new Set(
    bills.map((b) => b.prescription_id).filter(Boolean)
  );

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const term = search.toLowerCase();
    const rxId = (rx.rx_id || "").toLowerCase();
    const patientName = (
      rx.patient_name ||
      (rx.patient ? `${rx.patient.first_name || ""} ${rx.patient.last_name || ""}` : "")
    ).toLowerCase();
    const doctorName = (rx.doctor_name || rx.doctor_name_display || "").toLowerCase();

    const matchesSearch = rxId.includes(term) || patientName.includes(term) || doctorName.includes(term);

    const isDispensed = dispensedRxIds.has(rx.id);
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && !isDispensed) ||
      (statusFilter === "DISPENSED" && isDispensed);

    return matchesSearch && matchesStatus;
  });

  const pendingCount = prescriptions.filter((rx) => !dispensedRxIds.has(rx.id)).length;
  const dispensedCount = prescriptions.filter((rx) => dispensedRxIds.has(rx.id)).length;

  return (
    <main className="container-fluid p-4 space-y-4">
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-slate-900">Doctor Prescriptions & Dispensation Queue</h4>
          <p className="text-muted small mb-0">
            Review prescriptions issued by OPD doctors and dispense medicines directly from pharmacy inventory.
          </p>
        </div>
        <button
          className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1 shadow-xs"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {/* Metric Counters */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Pending Dispensation</span>
                <h3 className="fw-bold mt-1 mb-0 text-amber-500">{pendingCount}</h3>
                <small className="text-muted">Awaiting Medicine Issue</small>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-4">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Dispensed & Invoiced</span>
                <h3 className="fw-bold mt-1 mb-0 text-emerald-600">{dispensedCount}</h3>
                <small className="text-muted">Completed Orders</small>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-4">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Prescriptions</span>
                <h3 className="fw-bold mt-1 mb-0 text-slate-900">{prescriptions.length}</h3>
                <small className="text-muted">All Time Prescriptions</small>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
                <FileText size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Search by Rx ID, Patient Name, or Doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-md-end gap-2">
              <select
                className="form-select bg-light border-0 small"
                style={{ maxWidth: "240px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Prescriptions ({prescriptions.length})</option>
                <option value="PENDING">Pending Dispensation ({pendingCount})</option>
                <option value="DISPENSED">Dispensed ({dispensedCount})</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-slate-50 text-slate-600 small text-uppercase">
              <tr>
                <th className="ps-4">Rx ID</th>
                <th>Patient Details</th>
                <th>Prescribing Doctor</th>
                <th>Diagnosis & Meds</th>
                <th>Prescription Date</th>
                <th>Dispensation Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrescriptions.map((rx) => {
                const isDispensed = dispensedRxIds.has(rx.id);
                const matchingBill = bills.find((b) => b.prescription_id === rx.id);
                const meds = rx.medicines || rx.prescription_medicines || [];
                const patientName =
                  rx.patient_name ||
                  (rx.patient ? `${rx.patient.first_name} ${rx.patient.last_name || ""}` : "Patient");

                return (
                  <tr key={rx.id}>
                    <td className="ps-4">
                      <span className="badge bg-primary bg-opacity-10 text-primary font-monospace fw-bold px-2 py-1">
                        {rx.rx_id || `RX-${rx.id}`}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold text-slate-900">{patientName}</div>
                        <span className="badge bg-slate-100 text-slate-600 rounded-pill small font-monospace">
                          {rx.patient?.patient_id || rx.patient_id || "-"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="small text-slate-800 fw-semibold">
                        {rx.doctor_name_display || rx.doctor_name || "Doctor"}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold small text-slate-900">{rx.diagnosis || "General Evaluation"}</div>
                      <div className="text-muted small">
                        <Pill size={12} className="me-1" />
                        {meds.length} prescribed medications
                      </div>
                    </td>
                    <td className="text-muted small">
                      {rx.created_at
                        ? new Date(rx.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td>
                      {isDispensed ? (
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 small fw-semibold">
                          Dispensed
                        </span>
                      ) : (
                        <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-1 small fw-semibold">
                          Pending Dispense
                        </span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-light rounded-pill p-1"
                          onClick={() => setSelectedRxDetail(rx)}
                          title="View Rx Details"
                        >
                          <Eye size={15} className="text-slate-600" />
                        </button>

                        {!isDispensed ? (
                          <button
                            className="btn btn-sm btn-primary rounded-pill px-3 d-flex align-items-center gap-1 shadow-xs"
                            onClick={() => navigate(`/pharmacist/dispense/${rx.id}`)}
                          >
                            <Pill size={14} />
                            <span className="small">Dispense</span>
                          </button>
                        ) : (
                          matchingBill && (
                            <Link
                              className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 small"
                              to={`/pharmacist/bills/${matchingBill.id}`}
                            >
                              View Bill
                            </Link>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPrescriptions.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <FileText size={36} className="text-slate-300 mb-2" />
                    <p className="mb-0">No prescription records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Details Modal */}
      {selectedRxDetail && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3">
                <h5 className="modal-title fs-6 fw-semibold d-flex align-items-center gap-2">
                  <FileText size={18} className="text-primary" /> Prescription Summary ({selectedRxDetail.rx_id || `RX-${selectedRxDetail.id}`})
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-pill px-2"
                  onClick={() => setSelectedRxDetail(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="row g-2 small">
                    <div className="col-6">
                      <span className="text-muted d-block">Patient Name</span>
                      <strong className="text-slate-900">
                        {selectedRxDetail.patient_name || selectedRxDetail.patient?.full_name || "Patient"}
                      </strong>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-muted d-block">Doctor</span>
                      <strong className="text-primary">
                        {selectedRxDetail.doctor_name_display || selectedRxDetail.doctor_name || "Doctor"}
                      </strong>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-slate-800 small text-uppercase mb-2">Prescribed Medicines</h6>
                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered small mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedRxDetail.medicines || selectedRxDetail.prescription_medicines || []).map((m, i) => (
                        <tr key={i}>
                          <td className="fw-semibold">{m.medicine_name || `Medicine #${m.medicine}`}</td>
                          <td>{m.dosage}</td>
                          <td>{m.frequency}</td>
                          <td>{m.duration}</td>
                          <td>{m.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer bg-slate-50 px-4 py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-4"
                  onClick={() => setSelectedRxDetail(null)}
                >
                  Close
                </button>
                {!dispensedRxIds.has(selectedRxDetail.id) && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm"
                    onClick={() => {
                      const id = selectedRxDetail.id;
                      setSelectedRxDetail(null);
                      navigate(`/pharmacist/dispense/${id}`);
                    }}
                  >
                    Proceed to Dispense →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PrescriptionList;
