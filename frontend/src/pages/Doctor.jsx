import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Search,
  Pill,
  FlaskConical,
  LogOut,
  Eye,
  Trash2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const Doctor = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("queue");

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [labTests, setLabTests] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showPrescriptionModal, setShowPrescriptionModal] =
    useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [viewRxDetail, setViewRxDetail] = useState(null);

  const [alertMsg, setAlertMsg] = useState({
    type: "",
    text: "",
  });

  const [loading, setLoading] = useState(false);

  const [rxForm, setRxForm] = useState({
    diagnosis: "",
    bp: "120/80",
    pulse: "76",
    temp: "98.6",
    symptoms: "",
    clinical_notes: "",
    follow_up_date: "",
    notes: "",
    medicines: [],
    lab_tests: [],
  });

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {};
  };

  const showAlert = (type, text) => {
    setAlertMsg({
      type,
      text,
    });

    setTimeout(() => {
      setAlertMsg({
        type: "",
        text: "",
      });
    }, 4000);
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadBackendData = async () => {
    const headers = getHeaders();

    try {
      setLoading(true);

      // -----------------------------------------------------
      // 1. PATIENTS
      // -----------------------------------------------------

      try {
        const res = await axios.get(
          `${API_URL}/patients/`,
          { headers }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        const formattedPatients = data.map((p) => ({
          id: p.patient_id,
          patient_id: p.patient_id,
          name:
            p.full_name ||
            `${p.first_name || ""} ${p.last_name || ""}`.trim(),
          age: p.age,
          gender: p.gender,
          blood_group: p.blood_group,
          phone: p.phone,
          email: p.email,
          address: p.address,
        }));

        setPatients(formattedPatients);
      } catch (error) {
        console.error("Patient loading error:", error);
      }

      // -----------------------------------------------------
      // 2. MEDICINES
      // -----------------------------------------------------

      try {
        const res = await axios.get(
          `${API_URL}/pharmacy/medicines/`,
          { headers }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        setMedicines(data);
      } catch (error) {
        console.error("Medicine loading error:", error);
      }

      // -----------------------------------------------------
      // 3. LAB TESTS
      // -----------------------------------------------------

      try {
        const res = await axios.get(
          `${API_URL}/laboratory/tests/`,
          { headers }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        setLabTests(data);
      } catch (error) {
        console.error("Lab test loading error:", error);
      }

      // -----------------------------------------------------
      // 4. PRESCRIPTIONS
      // -----------------------------------------------------

      try {
        const res = await axios.get(
          `${API_URL}/prescriptions/`,
          { headers }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        setPrescriptions(data);
      } catch (error) {
        console.error("Prescription loading error:", error);
      }

      // -----------------------------------------------------
      // 5. DOCTOR QUEUE
      // -----------------------------------------------------

      try {
        const res = await axios.get(
          `${API_URL}/appointments/doctor-queue/`,
          { headers }
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        setAppointments(
          data.map((apt) => ({
            ...apt,

            patient_name:
              apt.patient_name ||
              apt.patient?.full_name ||
              "Unknown Patient",

            patient_id:
              apt.patient_id ||
              apt.patient?.patient_id ||
              "",

            status:
              apt.status ||
              "CHECKED_IN",

            time:
              apt.appointment_time ||
              apt.time ||
              "",

            reason:
              apt.reason ||
              "General Consultation",

            age:
              apt.patient_age ||
              apt.patient?.age ||
              "",

            gender:
              apt.patient_gender ||
              apt.patient?.gender ||
              "",

            token_number:
              apt.token_number || null,
          }))
        );
      } catch (error) {
        console.error("Doctor queue loading error:", error);

        /*
         * If your backend currently uses another doctor queue URL,
         * keep this empty instead of creating fake appointments.
         */
        setAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // =========================================================
  // START CONSULTATION
  // =========================================================

  const handleStartConsultation = (appointment) => {
    setSelectedAppointment(appointment);

    setRxForm({
      diagnosis: "",
      bp: "120/80",
      pulse: "76",
      temp: "98.6",
      symptoms: appointment.reason || "",
      clinical_notes: "",
      follow_up_date: "",
      notes: "",
      medicines: [],
      lab_tests: [],
    });

    setShowPrescriptionModal(true);
  };

  // =========================================================
  // ADD MEDICINE
  // =========================================================

  const addMedicine = () => {
    setRxForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicine: "",
          dosage: "",
          frequency: "",
          duration: "",
          quantity: "",
        },
      ],
    }));
  };

  const removeMedicine = (index) => {
    setRxForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateMedicine = (index, field, value) => {
    setRxForm((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine, i) =>
        i === index
          ? {
              ...medicine,
              [field]: value,
            }
          : medicine
      ),
    }));
  };

  // =========================================================
  // ADD LAB TEST
  // =========================================================

  const addLabTest = () => {
    setRxForm((prev) => ({
      ...prev,
      lab_tests: [
        ...prev.lab_tests,
        {
          test: "",
          notes: "",
        },
      ],
    }));
  };

  const removeLabTest = (index) => {
    setRxForm((prev) => ({
      ...prev,
      lab_tests: prev.lab_tests.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateLabTest = (index, field, value) => {
    setRxForm((prev) => ({
      ...prev,
      lab_tests: prev.lab_tests.map((test, i) =>
        i === index
          ? {
              ...test,
              [field]: value,
            }
          : test
      ),
    }));
  };

  // =========================================================
  // SAVE CONSULTATION + PRESCRIPTION
  // =========================================================

  const handleSavePrescription = async (e) => {
    e.preventDefault();

    if (!selectedAppointment) {
      showAlert(
        "danger",
        "No appointment selected."
      );
      return;
    }

    if (!rxForm.diagnosis.trim()) {
      showAlert(
        "danger",
        "Please enter the clinical diagnosis."
      );
      return;
    }

    const headers = getHeaders();

    try {
      setLoading(true);

      // -----------------------------------------------------
      // STEP 1: CREATE CONSULTATION
      // -----------------------------------------------------

      const consultationPayload = {
        appointment: selectedAppointment.id,
        chief_complaint: rxForm.symptoms,
        symptoms: rxForm.symptoms,
        diagnosis: rxForm.diagnosis,
        clinical_notes: rxForm.clinical_notes,
        follow_up_date:
          rxForm.follow_up_date || null,
      };

      const consultationResponse = await axios.post(
        `${API_URL}/consultations/`,
        consultationPayload,
        { headers }
      );

      const consultation =
        consultationResponse.data;

      // -----------------------------------------------------
      // STEP 2: CREATE PRESCRIPTION
      // -----------------------------------------------------

      const prescriptionPayload = {
        consultation: consultation.id,

        blood_pressure: rxForm.bp,
        pulse: rxForm.pulse,
        temperature: rxForm.temp,

        notes: rxForm.notes,

        medicines: rxForm.medicines
          .filter((m) => m.medicine)
          .map((m) => ({
            medicine: Number(m.medicine),
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            quantity: Number(m.quantity),
          })),

        lab_tests: rxForm.lab_tests
          .filter((t) => t.test)
          .map((t) => ({
            test: Number(t.test),
            notes: t.notes,
          })),

        external_medicines: [],

        external_lab_tests: [],
      };

      const prescriptionResponse =
        await axios.post(
          `${API_URL}/prescriptions/`,
          prescriptionPayload,
          { headers }
        );

      const savedPrescription =
        prescriptionResponse.data;

      // -----------------------------------------------------
      // UPDATE LOCAL QUEUE
      // -----------------------------------------------------

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                status: "COMPLETED",
              }
            : apt
        )
      );

      setPrescriptions((prev) => [
        savedPrescription,
        ...prev,
      ]);

      setShowPrescriptionModal(false);
      setSelectedAppointment(null);

      showAlert(
        "success",
        `Prescription ${savedPrescription.rx_id} saved successfully.`
      );
    } catch (error) {
      console.error(
        "Consultation / Prescription error:",
        error.response?.data || error
      );

      let message =
        "Failed to save consultation.";

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === "string") {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else {
          message = Object.entries(data)
            .map(([key, value]) => {
              const text = Array.isArray(value)
                ? value.join(", ")
                : String(value);

              return `${key}: ${text}`;
            })
            .join(" | ");
        }
      }

      showAlert(
        "danger",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================================================
  // FILTER QUEUE
  // =========================================================

  const filteredAppointments =
    appointments.filter((apt) => {
      const searchText =
        `${apt.patient_name} ${apt.patient_id} ${apt.reason}`
          .toLowerCase();

      const matchesSearch =
        searchText.includes(
          searchQuery.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        apt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="d-flex flex-column min-vh-100 bg-slate-50 text-dark">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar navbar-expand navbar-dark bg-slate-900 px-3 px-md-4 py-3 shadow-xs sticky-top">
        <div className="container-fluid px-0">

          <div className="d-flex align-items-center gap-2">

            <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
              <Stethoscope size={20} />
            </div>

            <div>
              <span className="navbar-brand mb-0 fw-bold fs-6 text-white">
                ClinicCare
              </span>

              <span
                className="badge bg-slate-800 text-slate-400 p-0 text-uppercase d-block"
                style={{ fontSize: "10px" }}
              >
                Doctor Portal
              </span>
            </div>

          </div>

          <div className="d-flex align-items-center gap-3">

            <div className="text-end d-none d-sm-block">

              <div className="text-white fw-semibold small">
                {user?.first_name
                  ? `Dr. ${user.first_name} ${
                      user.last_name || ""
                    }`
                  : "Doctor"}
              </div>

              <small
                className="text-slate-400"
                style={{ fontSize: "11px" }}
              >
                Doctor
              </small>

            </div>

            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 rounded-2"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              <span className="d-none d-sm-inline">
                Sign Out
              </span>
            </button>

          </div>

        </div>
      </nav>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="bg-white border-bottom shadow-xs">

        <div className="container py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">

          <div className="d-flex gap-2">

            <button
              className={`btn btn-sm px-3 rounded-2 fw-medium ${
                activeTab === "queue"
                  ? "btn-primary text-white"
                  : "btn-light text-slate-700"
              }`}
              onClick={() => {
                setActiveTab("queue");
                setSearchQuery("");
              }}
            >
              <Users size={16} className="me-1" />
              Patient Queue
            </button>

            <button
              className={`btn btn-sm px-3 rounded-2 fw-medium ${
                activeTab === "prescriptions"
                  ? "btn-primary text-white"
                  : "btn-light text-slate-700"
              }`}
              onClick={() => {
                setActiveTab("prescriptions");
                setSearchQuery("");
              }}
            >
              <FileText size={16} className="me-1" />
              Prescriptions & History
              {" "}
              ({prescriptions.length})
            </button>

          </div>

          <button
            className="btn btn-success btn-sm rounded-2 d-flex align-items-center gap-1 fw-medium px-3"
            onClick={() => {
              setSelectedAppointment(null);

              setRxForm({
                diagnosis: "",
                bp: "120/80",
                pulse: "76",
                temp: "98.6",
                symptoms: "",
                clinical_notes: "",
                follow_up_date: "",
                notes: "",
                medicines: [],
                lab_tests: [],
              });

              setShowPrescriptionModal(true);
            }}
          >
            <Plus size={16} />
            New Prescription
          </button>

        </div>

      </div>

      {/* =====================================================
          ALERT
      ===================================================== */}

      {alertMsg.text && (
        <div className="container mt-3">

          <div
            className={`alert alert-${alertMsg.type} border-0 py-2 mb-0 d-flex align-items-center gap-2 rounded-3`}
          >
            {alertMsg.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}

            <span className="small">
              {alertMsg.text}
            </span>

          </div>

        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="container my-4 flex-grow-1">

        {/* STATS */}

        <div className="row g-3 mb-4">

          <div className="col-md-4">

            <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <span className="text-muted small fw-semibold text-uppercase">
                    Patients in Queue
                  </span>

                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">
                    {
                      appointments.filter(
                        (a) =>
                          a.status === "CHECKED_IN" ||
                          a.status === "IN_CONSULTATION"
                      ).length
                    }
                  </h3>

                  <small className="text-muted">
                    Awaiting consultation
                  </small>

                </div>

                <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                  <Users size={24} />
                </div>

              </div>

            </div>

          </div>

          <div className="col-md-4">

            <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <span className="text-muted small fw-semibold text-uppercase">
                    Completed Today
                  </span>

                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">
                    {
                      appointments.filter(
                        (a) =>
                          a.status === "COMPLETED"
                      ).length
                    }
                  </h3>

                  <small className="text-muted">
                    Consultations finished
                  </small>

                </div>

                <div className="bg-success bg-opacity-10 text-success rounded-3 p-3">
                  <CheckCircle2 size={24} />
                </div>

              </div>

            </div>

          </div>

          <div className="col-md-4">

            <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <span className="text-muted small fw-semibold text-uppercase">
                    Total Prescriptions
                  </span>

                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">
                    {prescriptions.length}
                  </h3>

                  <small className="text-muted">
                    Records on file
                  </small>

                </div>

                <div className="bg-amber-subtle text-warning rounded-3 p-3">
                  <FileText size={24} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            QUEUE
        =================================================== */}

        {activeTab === "queue" && (

          <div className="card border-0 shadow-xs rounded-3 bg-white">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">

                <div>

                  <h6 className="fw-bold mb-0 text-slate-900">
                    Today's Patient Queue
                  </h6>

                  <small className="text-muted">
                    Patients checked in for consultation
                  </small>

                </div>

                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={loadBackendData}
                >
                  Refresh
                </button>

              </div>

              <div className="row g-2 mb-3">

                <div className="col-md-6">

                  <div className="input-group input-group-sm">

                    <span className="input-group-text bg-white">
                      <Search size={15} />
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search patient..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                    />

                  </div>

                </div>

                <div className="col-md-4">

                  <select
                    className="form-select form-select-sm"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                  >
                    <option value="ALL">
                      All Statuses
                    </option>

                    <option value="CHECKED_IN">
                      Checked In
                    </option>

                    <option value="IN_CONSULTATION">
                      In Consultation
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>

                  </select>

                </div>

              </div>

              <div className="table-responsive rounded-2 border">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light small">

                    <tr>

                      <th className="px-3">
                        Token
                      </th>

                      <th>
                        Time
                      </th>

                      <th>
                        Patient
                      </th>

                      <th>
                        Reason
                      </th>

                      <th>
                        Status
                      </th>

                      <th className="text-end px-3">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="small">

                    {loading ? (

                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-5"
                        >
                          Loading...
                        </td>
                      </tr>

                    ) : filteredAppointments.length === 0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="text-center text-muted py-5"
                        >

                          <Users
                            size={32}
                            className="mb-2"
                          />

                          <div>
                            No patients in queue.
                          </div>

                        </td>

                      </tr>

                    ) : (

                      filteredAppointments.map(
                        (apt) => (

                          <tr key={apt.id}>

                            <td className="px-3">

                              <span className="badge bg-primary-subtle text-primary">
                                {apt.token_number ||
                                  "—"}
                              </span>

                            </td>

                            <td className="fw-semibold">

                              <Clock
                                size={14}
                                className="me-1"
                              />

                              {apt.time || "—"}

                            </td>

                            <td>

                              <strong className="d-block">
                                {apt.patient_name}
                              </strong>

                              <small className="text-muted">
                                {apt.patient_id}
                                {" • "}
                                {apt.age}y
                                {" / "}
                                {apt.gender}
                              </small>

                            </td>

                            <td>
                              {apt.reason}
                            </td>

                            <td>

                              <span
                                className={`badge rounded-pill ${
                                  apt.status ===
                                  "COMPLETED"
                                    ? "bg-success-subtle text-success"
                                    : apt.status ===
                                      "IN_CONSULTATION"
                                    ? "bg-warning-subtle text-warning-emphasis"
                                    : "bg-primary-subtle text-primary"
                                }`}
                              >
                                {apt.status}
                              </span>

                            </td>

                            <td className="text-end px-3">

                              {apt.status !==
                              "COMPLETED" ? (

                                <button
                                  className="btn btn-primary btn-sm rounded-2"
                                  onClick={() =>
                                    handleStartConsultation(
                                      apt
                                    )
                                  }
                                >
                                  Start Consultation
                                </button>

                              ) : (

                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                >
                                  Completed
                                </button>

                              )}

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

        {/* ===================================================
            PRESCRIPTIONS
        =================================================== */}

        {activeTab === "prescriptions" && (

          <div className="card border-0 shadow-xs rounded-3 bg-white">

            <div className="card-body p-4">

              <div className="mb-3">

                <h6 className="fw-bold mb-0">
                  Clinical Prescriptions & History
                </h6>

                <small className="text-muted">
                  Review prescriptions created by the doctor
                </small>

              </div>

              <div className="table-responsive rounded-2 border">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light small">

                    <tr>

                      <th className="px-3">
                        Rx ID
                      </th>

                      <th>
                        Patient
                      </th>

                      <th>
                        Diagnosis
                      </th>

                      <th>
                        Medicines
                      </th>

                      <th>
                        Lab Tests
                      </th>

                      <th className="text-end px-3">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="small">

                    {prescriptions.length === 0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="text-center text-muted py-5"
                        >
                          No prescriptions found.
                        </td>

                      </tr>

                    ) : (

                      prescriptions.map(
                        (rx) => (

                          <tr key={rx.id}>

                            <td className="px-3">

                              <strong className="font-monospace">
                                {rx.rx_id}
                              </strong>

                              <small className="d-block text-muted">
                                {rx.created_at
                                  ? new Date(
                                      rx.created_at
                                    ).toLocaleDateString()
                                  : ""}
                              </small>

                            </td>

                            <td>

                              <strong>
                                {rx.patient_name}
                              </strong>

                              <small className="d-block text-muted">
                                {rx.patient}
                              </small>

                            </td>

                            <td>
                              {rx.diagnosis}
                            </td>

                            <td>

                              {rx.medicines?.length ? (

                                <span className="badge bg-success-subtle text-success">
                                  <Pill
                                    size={13}
                                    className="me-1"
                                  />
                                  {rx.medicines.length}
                                  {" "}
                                  medicine(s)
                                </span>

                              ) : (
                                <span className="text-muted">
                                  None
                                </span>
                              )}

                            </td>

                            <td>

                              {rx.lab_tests?.length ? (

                                <span className="badge bg-info-subtle text-info-emphasis">
                                  <FlaskConical
                                    size={13}
                                    className="me-1"
                                  />
                                  {rx.lab_tests.length}
                                  {" "}
                                  test(s)
                                </span>

                              ) : (
                                <span className="text-muted">
                                  None
                                </span>
                              )}

                            </td>

                            <td className="text-end px-3">

                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() =>
                                  setViewRxDetail(rx)
                                }
                              >
                                <Eye size={15} />
                              </button>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      </div>

      {/* =====================================================
          CONSULTATION + PRESCRIPTION MODAL
      ===================================================== */}

      {showPrescriptionModal && (

        <div className="modal show d-block bg-dark bg-opacity-50">

          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content border-0 shadow-lg rounded-3">

              <div className="modal-header bg-slate-900 text-white">

                <div>

                  <h6 className="modal-title fw-bold">
                    Medical Consultation & Prescription
                  </h6>

                  {selectedAppointment && (
                    <small className="text-slate-400">
                      {selectedAppointment.patient_name}
                      {" • "}
                      {selectedAppointment.patient_id}
                    </small>
                  )}

                </div>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() =>
                    setShowPrescriptionModal(false)
                  }
                />

              </div>

              <form onSubmit={handleSavePrescription}>

                <div className="modal-body p-4">

                  {/* PATIENT */}

                  {selectedAppointment && (

                    <div className="alert alert-light border mb-4">

                      <strong>
                        Patient:
                      </strong>{" "}
                      {selectedAppointment.patient_name}

                      <br />

                      <small className="text-muted">
                        ID:{" "}
                        {selectedAppointment.patient_id}
                        {" • "}
                        Token:{" "}
                        {selectedAppointment.token_number ||
                          "—"}
                      </small>

                    </div>

                  )}

                  {/* VITALS */}

                  <h6 className="fw-bold text-secondary mb-2">
                    1. Patient Vital Signs
                  </h6>

                  <div className="row g-2 mb-4">

                    <div className="col-md-4">

                      <label className="form-label small">
                        Blood Pressure
                      </label>

                      <input
                        className="form-control form-control-sm"
                        value={rxForm.bp}
                        onChange={(e) =>
                          setRxForm({
                            ...rxForm,
                            bp: e.target.value,
                          })
                        }
                      />

                    </div>

                    <div className="col-md-4">

                      <label className="form-label small">
                        Pulse
                      </label>

                      <input
                        className="form-control form-control-sm"
                        value={rxForm.pulse}
                        onChange={(e) =>
                          setRxForm({
                            ...rxForm,
                            pulse: e.target.value,
                          })
                        }
                      />

                    </div>

                    <div className="col-md-4">

                      <label className="form-label small">
                        Temperature
                      </label>

                      <input
                        className="form-control form-control-sm"
                        value={rxForm.temp}
                        onChange={(e) =>
                          setRxForm({
                            ...rxForm,
                            temp: e.target.value,
                          })
                        }
                      />

                    </div>

                  </div>

                  {/* SYMPTOMS */}

                  <h6 className="fw-bold text-secondary mb-2">
                    2. Symptoms / Chief Complaint
                  </h6>

                  <textarea
                    className="form-control form-control-sm mb-4"
                    rows="2"
                    value={rxForm.symptoms}
                    onChange={(e) =>
                      setRxForm({
                        ...rxForm,
                        symptoms: e.target.value,
                      })
                    }
                  />

                  {/* DIAGNOSIS */}

                  <h6 className="fw-bold text-secondary mb-2">
                    3. Clinical Diagnosis *
                  </h6>

                  <input
                    required
                    className="form-control form-control-sm mb-4"
                    placeholder="e.g. Viral Fever"
                    value={rxForm.diagnosis}
                    onChange={(e) =>
                      setRxForm({
                        ...rxForm,
                        diagnosis: e.target.value,
                      })
                    }
                  />

                  {/* CLINICAL NOTES */}

                  <h6 className="fw-bold text-secondary mb-2">
                    4. Clinical Notes
                  </h6>

                  <textarea
                    className="form-control form-control-sm mb-4"
                    rows="3"
                    placeholder="Clinical examination notes..."
                    value={rxForm.clinical_notes}
                    onChange={(e) =>
                      setRxForm({
                        ...rxForm,
                        clinical_notes: e.target.value,
                      })
                    }
                  />

                  {/* MEDICINES */}

                  <div className="d-flex justify-content-between align-items-center mb-2">

                    <h6 className="fw-bold text-secondary mb-0">
                      5. Prescribed Medicines
                    </h6>

                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm"
                      onClick={addMedicine}
                    >
                      <Plus size={14} />
                      Add Medicine
                    </button>

                  </div>

                  {rxForm.medicines.length === 0 && (

                    <div className="border rounded-2 p-3 text-center text-muted small mb-4">
                      No medicines added.
                    </div>

                  )}

                  {rxForm.medicines.map(
                    (medicine, index) => (

                      <div
                        key={index}
                        className="border rounded-2 p-3 mb-2"
                      >

                        <div className="row g-2">

                          <div className="col-md-4">

                            <label className="small">
                              Medicine
                            </label>

                            <select
                              className="form-select form-select-sm"
                              value={medicine.medicine}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "medicine",
                                  e.target.value
                                )
                              }
                            >

                              <option value="">
                                Select medicine
                              </option>

                              {medicines.map(
                                (med) => (

                                  <option
                                    key={med.id}
                                    value={med.id}
                                  >
                                    {med.name}
                                    {" "}
                                    ({med.medicine_id})
                                  </option>

                                )
                              )}

                            </select>

                          </div>

                          <div className="col-md-2">

                            <label className="small">
                              Dosage
                            </label>

                            <input
                              className="form-control form-control-sm"
                              placeholder="500mg"
                              value={medicine.dosage}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "dosage",
                                  e.target.value
                                )
                              }
                            />

                          </div>

                          <div className="col-md-2">

                            <label className="small">
                              Frequency
                            </label>

                            <input
                              className="form-control form-control-sm"
                              placeholder="Twice daily"
                              value={medicine.frequency}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "frequency",
                                  e.target.value
                                )
                              }
                            />

                          </div>

                          <div className="col-md-2">

                            <label className="small">
                              Duration
                            </label>

                            <input
                              className="form-control form-control-sm"
                              placeholder="5 days"
                              value={medicine.duration}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                            />

                          </div>

                          <div className="col-md-1">

                            <label className="small">
                              Qty
                            </label>

                            <input
                              type="number"
                              min="1"
                              className="form-control form-control-sm"
                              value={medicine.quantity}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />

                          </div>

                          <div className="col-md-1 d-flex align-items-end">

                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                removeMedicine(index)
                              }
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                  {/* LAB TESTS */}

                  <div className="d-flex justify-content-between align-items-center mt-4 mb-2">

                    <h6 className="fw-bold text-secondary mb-0">
                      6. Laboratory Tests
                    </h6>

                    <button
                      type="button"
                      className="btn btn-outline-info btn-sm"
                      onClick={addLabTest}
                    >
                      <Plus size={14} />
                      Add Lab Test
                    </button>

                  </div>

                  {rxForm.lab_tests.length === 0 && (

                    <div className="border rounded-2 p-3 text-center text-muted small">
                      No laboratory tests ordered.
                    </div>

                  )}

                  {rxForm.lab_tests.map(
                    (test, index) => (

                      <div
                        key={index}
                        className="border rounded-2 p-3 mb-2"
                      >

                        <div className="row g-2">

                          <div className="col-md-5">

                            <label className="small">
                              Laboratory Test
                            </label>

                            <select
                              className="form-select form-select-sm"
                              value={test.test}
                              onChange={(e) =>
                                updateLabTest(
                                  index,
                                  "test",
                                  e.target.value
                                )
                              }
                            >

                              <option value="">
                                Select test
                              </option>

                              {labTests.map(
                                (lab) => (

                                  <option
                                    key={lab.id}
                                    value={lab.id}
                                  >
                                    {lab.test_name}
                                    {" "}
                                    ({lab.test_code})
                                  </option>

                                )
                              )}

                            </select>

                          </div>

                          <div className="col-md-6">

                            <label className="small">
                              Notes
                            </label>

                            <input
                              className="form-control form-control-sm"
                              placeholder="Any special instruction..."
                              value={test.notes}
                              onChange={(e) =>
                                updateLabTest(
                                  index,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />

                          </div>

                          <div className="col-md-1 d-flex align-items-end">

                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                removeLabTest(index)
                              }
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                  {/* ADVICE */}

                  <h6 className="fw-bold text-secondary mt-4 mb-2">
                    7. Doctor's Advice
                  </h6>

                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="Take medicines after food..."
                    value={rxForm.notes}
                    onChange={(e) =>
                      setRxForm({
                        ...rxForm,
                        notes: e.target.value,
                      })
                    }
                  />

                </div>

                {/* FOOTER */}

                <div className="modal-footer bg-slate-50">

                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() =>
                      setShowPrescriptionModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : "Save Consultation & Prescription"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          VIEW PRESCRIPTION
      ===================================================== */}

      {viewRxDetail && (

        <div className="modal show d-block bg-dark bg-opacity-50">

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content border-0 shadow-lg rounded-3">

              <div className="modal-header bg-slate-900 text-white">

                <div>

                  <h6 className="modal-title fw-bold">
                    Prescription Details
                  </h6>

                  <small className="text-slate-400">
                    {viewRxDetail.rx_id}
                  </small>

                </div>

                <button
                  className="btn-close btn-close-white"
                  onClick={() =>
                    setViewRxDetail(null)
                  }
                />

              </div>

              <div className="modal-body p-4">

                <div className="mb-3">

                  <strong>
                    Patient
                  </strong>

                  <div>
                    {viewRxDetail.patient_name}
                  </div>

                </div>

                <div className="mb-3">

                  <strong>
                    Diagnosis
                  </strong>

                  <div>
                    {viewRxDetail.diagnosis}
                  </div>

                </div>

                <hr />

                <h6 className="fw-bold">
                  Medicines
                </h6>

                {viewRxDetail.medicines?.length ? (

                  <ul className="list-group mb-3">

                    {viewRxDetail.medicines.map(
                      (medicine, index) => (

                        <li
                          key={index}
                          className="list-group-item"
                        >

                          <strong>
                            {medicine.medicine_name}
                          </strong>

                          <br />

                          <small>
                            {medicine.dosage}
                            {" • "}
                            {medicine.frequency}
                            {" • "}
                            {medicine.duration}
                            {" • Qty: "}
                            {medicine.quantity}
                          </small>

                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p className="text-muted">
                    No medicines prescribed.
                  </p>

                )}

                <h6 className="fw-bold">
                  Laboratory Tests
                </h6>

                {viewRxDetail.lab_tests?.length ? (

                  <ul className="list-group">

                    {viewRxDetail.lab_tests.map(
                      (test, index) => (

                        <li
                          key={index}
                          className="list-group-item"
                        >
                          <strong>
                            {test.test_name}
                          </strong>

                          {test.notes && (
                            <small className="d-block text-muted">
                              {test.notes}
                            </small>
                          )}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p className="text-muted">
                    No lab tests ordered.
                  </p>

                )}

                {viewRxDetail.notes && (

                  <div className="mt-3">

                    <h6 className="fw-bold">
                      Doctor's Advice
                    </h6>

                    <p className="text-muted small">
                      {viewRxDetail.notes}
                    </p>

                  </div>

                )}

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setViewRxDetail(null)
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>
        {`
          .bg-slate-50 {
            background-color: #f8fafc;
          }

          .bg-slate-800 {
            background-color: #1e293b;
          }

          .bg-slate-900 {
            background-color: #0f172a;
          }

          .text-slate-400 {
            color: #94a3b8;
          }

          .text-slate-600 {
            color: #475569;
          }

          .text-slate-700 {
            color: #334155;
          }

          .text-slate-800 {
            color: #1e293b;
          }

          .text-slate-900 {
            color: #0f172a;
          }

          .bg-amber-subtle {
            background-color: #fffbeb;
          }

          .shadow-xs {
            box-shadow:
              0 1px 2px 0
              rgba(0, 0, 0, 0.04);
          }
        `}
      </style>

    </div>
  );
};

export default Doctor;