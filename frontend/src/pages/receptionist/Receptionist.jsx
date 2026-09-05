import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  UserPlus,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Clock,
  CheckCircle,
  CreditCard,
  UserCheck,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const ENDPOINTS = {
  patients: `${API_URL}/patients/patients/`,
  appointments: `${API_URL}/appointments/appointments/`,
  availableSlots: `${API_URL}/appointments/appointments/available-slots/`,
  createBill: (appointmentId) =>
    `${API_URL}/billing/appointments/${appointmentId}/create/`,
  bills: `${API_URL}/billing/bills/`,
  payBill: (billId) =>
    `${API_URL}/billing/bills/${billId}/pay/`,
  checkIn: (appointmentId) =>
    `${API_URL}/appointments/appointments/${appointmentId}/check-in/`,

  // Change only this if your staff URL is different.
  doctors: `${API_URL}/staff/doctors/`,
};

const authConfig = () => {
  const token = localStorage.getItem("access");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  const firstKey = Object.keys(data)[0];

  if (firstKey) {
    const value = data[firstKey];

    if (Array.isArray(value)) {
      return `${firstKey}: ${value.join(", ")}`;
    }

    if (typeof value === "string") {
      return `${firstKey}: ${value}`;
    }
  }

  return "Request failed. Please check the entered details.";
};

const emptyPatientForm = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "FEMALE",
  blood_group: "O+",
  address: "",
  phone: "",
  email: "",
  next_visit_date: "",
};

const emptyAppointmentForm = {
  patient: "",
  doctor: "",
  appointment_date: "",
  appointment_time: "",
  reason: "",
};

const Receptionist = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [appointmentForm, setAppointmentForm] =
    useState(emptyAppointmentForm);

  const [patientSaving, setPatientSaving] = useState(false);
  const [appointmentSaving, setAppointmentSaving] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const receptionistName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username ||
    "Receptionist";

  // --------------------------------------------------
  // API
  // --------------------------------------------------

  const loadPatients = async () => {
    try {
      const response = await axios.get(
        ENDPOINTS.patients,
        authConfig()
      );

      setPatients(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error("Patients error:", error);
      setError(getErrorMessage(error));
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await axios.get(
        ENDPOINTS.appointments,
        authConfig()
      );

      setAppointments(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error("Appointments error:", error);
      setError(getErrorMessage(error));
    }
  };

  const loadBills = async () => {
    try {
      const response = await axios.get(
        ENDPOINTS.bills,
        authConfig()
      );

      setBills(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error("Bills error:", error);
      setError(getErrorMessage(error));
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await axios.get(
        ENDPOINTS.doctors,
        authConfig()
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setDoctors(data);
    } catch (error) {
      console.error("Doctors error:", error);

      /*
       * Don't break the complete receptionist page
       * if the staff endpoint is different.
       */
      setDoctors([]);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      loadPatients(),
      loadAppointments(),
      loadBills(),
      loadDoctors(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(
      (p) => Number(p.id) === Number(patientId)
    );

    return patient?.full_name || "Unknown Patient";
  };

  const getDoctorName = (doctor) => {
    if (!doctor) return "Unknown Doctor";

    if (doctor.doctor_name) {
      return doctor.doctor_name;
    }

    if (doctor.first_name || doctor.last_name) {
      return `Dr. ${doctor.first_name || ""} ${
        doctor.last_name || ""
      }`.trim();
    }

    if (doctor.user?.first_name || doctor.user?.last_name) {
      return `Dr. ${doctor.user?.first_name || ""} ${
        doctor.user?.last_name || ""
      }`.trim();
    }

    return doctor.staff_id || `Doctor #${doctor.id}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const [hour, minute] = time.split(":");

    const date = new Date();
    date.setHours(Number(hour), Number(minute));

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status) => {
    const map = {
      BOOKED: "primary",
      TOKEN_PENDING: "warning",
      CHECKED_IN: "success",
      IN_CONSULTATION: "info",
      COMPLETED: "secondary",
      CANCELLED: "danger",
      NO_SHOW: "dark",
    };

    return `badge text-bg-${map[status] || "secondary"}`;
  };

  // --------------------------------------------------
  // Patient
  // --------------------------------------------------

  const openPatientModal = () => {
    clearMessages();
    setPatientForm(emptyPatientForm);
    setShowPatientModal(true);
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;

    setPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();

    clearMessages();
    setPatientSaving(true);

    try {
      const payload = {
        ...patientForm,
      };

      if (!payload.next_visit_date) {
        delete payload.next_visit_date;
      }

      if (!payload.email) {
        delete payload.email;
      }

      const response = await axios.post(
        ENDPOINTS.patients,
        payload,
        authConfig()
      );

      setPatients((prev) => [response.data, ...prev]);

      setShowPatientModal(false);
      setPatientForm(emptyPatientForm);

      setSuccess(
        `Patient ${response.data.patient_id} registered successfully.`
      );

      setActiveTab("patients");
    } catch (error) {
      console.error("Patient registration error:", error);
      setError(getErrorMessage(error));
    } finally {
      setPatientSaving(false);
    }
  };

  // --------------------------------------------------
  // Appointment
  // --------------------------------------------------

  const openAppointmentModal = () => {
    clearMessages();

    setAppointmentForm({
      ...emptyAppointmentForm,
      appointment_date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setAvailableSlots([]);
    setShowAppointmentModal(true);
  };

  const handleAppointmentChange = async (e) => {
    const { name, value } = e.target;

    setAppointmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (
      name === "doctor" ||
      name === "appointment_date"
    ) {
      const doctor =
        name === "doctor"
          ? value
          : appointmentForm.doctor;

      const appointmentDate =
        name === "appointment_date"
          ? value
          : appointmentForm.appointment_date;

      if (doctor && appointmentDate) {
        await loadAvailableSlots(
          doctor,
          appointmentDate
        );
      } else {
        setAvailableSlots([]);
      }
    }
  };

  const loadAvailableSlots = async (
    doctorId,
    appointmentDate
  ) => {
    setLoadingSlots(true);
    setError("");

    try {
      const response = await axios.get(
        ENDPOINTS.availableSlots,
        {
          ...authConfig(),
          params: {
            doctor: doctorId,
            date: appointmentDate,
          },
        }
      );

      setAvailableSlots(
        response.data?.available_slots || []
      );
    } catch (error) {
      console.error("Available slots error:", error);

      setAvailableSlots([]);

      setError(getErrorMessage(error));
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!appointmentForm.patient) {
      setError("Please select a patient.");
      return;
    }

    if (!appointmentForm.doctor) {
      setError("Please select a doctor.");
      return;
    }

    if (!appointmentForm.appointment_date) {
      setError("Please select an appointment date.");
      return;
    }

    if (!appointmentForm.appointment_time) {
      setError("Please select an available time slot.");
      return;
    }

    setAppointmentSaving(true);

    try {
      const payload = {
        patient: Number(appointmentForm.patient),
        doctor: Number(appointmentForm.doctor),
        appointment_date:
          appointmentForm.appointment_date,
        appointment_time:
          appointmentForm.appointment_time,
        reason: appointmentForm.reason,
      };

      const response = await axios.post(
        ENDPOINTS.appointments,
        payload,
        authConfig()
      );

      setAppointments((prev) => [
        response.data,
        ...prev,
      ]);

      setShowAppointmentModal(false);

      setSuccess(
        `Appointment created successfully for ${response.data.patient_name}.`
      );

      setAppointmentForm(emptyAppointmentForm);
      setAvailableSlots([]);

      await loadAppointments();
      await loadBills();

      setActiveTab("appointments");
    } catch (error) {
      console.error(
        "Appointment creation error:",
        error
      );

      setError(getErrorMessage(error));
    } finally {
      setAppointmentSaving(false);
    }
  };

  // --------------------------------------------------
  // Billing
  // --------------------------------------------------

  const openBill = async (appointment) => {
    clearMessages();

    try {
      const response = await axios.post(
        ENDPOINTS.createBill(appointment.id),
        {},
        authConfig()
      );

      setSelectedAppointment(appointment);
      setSelectedBill(response.data.bill || response.data);

      setShowBillModal(true);

      await loadBills();
    } catch (error) {
      console.error("Bill creation error:", error);

      setError(getErrorMessage(error));
    }
  };

  const payBill = async () => {
    if (!selectedBill) return;

    setPaymentLoading(true);
    clearMessages();

    try {
      const response = await axios.post(
        ENDPOINTS.payBill(selectedBill.id),
        {
          payment_method: paymentMethod,
        },
        authConfig()
      );

      setSelectedBill(response.data);

      setSuccess(
        `Payment completed for bill ${
          response.data.bill_number || ""
        }.`
      );

      await loadBills();
      await loadAppointments();
    } catch (error) {
      console.error("Payment error:", error);

      setError(getErrorMessage(error));
    } finally {
      setPaymentLoading(false);
    }
  };

  // --------------------------------------------------
  // Check-in
  // --------------------------------------------------

  const handleCheckIn = async (appointment) => {
    clearMessages();

    try {
      const response = await axios.post(
        ENDPOINTS.checkIn(appointment.id),
        {},
        authConfig()
      );

      setSuccess(
        `${response.data.patient_name} checked in successfully. Token #${response.data.token_number}.`
      );

      await loadAppointments();
    } catch (error) {
      console.error("Check-in error:", error);

      setError(getErrorMessage(error));
    }
  };

  // --------------------------------------------------
  // Filtering
  // --------------------------------------------------

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();

    return (
      patient.patient_id
        ?.toLowerCase()
        .includes(search) ||
      patient.full_name
        ?.toLowerCase()
        .includes(search) ||
      patient.phone
        ?.toLowerCase()
        .includes(search)
    );
  });

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const todayAppointments = appointments.filter(
    (appointment) =>
      appointment.appointment_date === today
  );

  const checkedInCount = todayAppointments.filter(
    (appointment) =>
      appointment.status === "CHECKED_IN"
  ).length;

  const pendingBills = bills.filter(
    (bill) =>
      bill.payment_status === "PENDING"
  );

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: CalendarDays,
    },
    {
      id: "patients",
      label: "Patients",
      icon: Users,
    },
    {
      id: "billing",
      label: "Billing",
      icon: Receipt,
    },
  ];

  const navigateTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    clearMessages();
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-vh-100 bg-light">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`position-fixed top-0 start-0 h-100 bg-white border-end ${
          sidebarOpen
            ? "d-block"
            : "d-none d-md-block"
        }`}
        style={{
          width: "250px",
          zIndex: 1050,
        }}
      >
        <div className="d-flex flex-column h-100">

          <div className="p-4 border-bottom">
            <div className="d-flex align-items-center gap-2">

              <div
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 42,
                  height: 42,
                }}
              >
                <Stethoscope size={23} />
              </div>

              <div>
                <h6 className="fw-bold mb-0">
                  Clinic Management
                </h6>

                <small className="text-muted">
                  Receptionist
                </small>
              </div>

              <button
                className="btn btn-sm ms-auto d-md-none"
                onClick={() =>
                  setSidebarOpen(false)
                }
              >
                <X size={20} />
              </button>

            </div>
          </div>

          <div className="p-3 flex-grow-1">

            <small className="text-uppercase text-muted fw-semibold px-2">
              Main Menu
            </small>

            <div className="mt-2">

              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      navigateTab(item.id)
                    }
                    className={`btn w-100 text-start d-flex align-items-center gap-3 mb-1 ${
                      activeTab === item.id
                        ? "btn-primary"
                        : "btn-light"
                    }`}
                  >
                    <Icon size={19} />
                    {item.label}
                  </button>
                );
              })}

            </div>
          </div>

          <div className="p-3 border-top">

            <div className="d-flex align-items-center gap-2 mb-3">

              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 40,
                  height: 40,
                }}
              >
                {receptionistName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="overflow-hidden">
                <div className="fw-semibold text-truncate">
                  {receptionistName}
                </div>

                <small className="text-muted">
                  Receptionist
                </small>
              </div>

            </div>

            <button
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={logout}
            >
              <LogOut size={17} />
              Logout
            </button>

          </div>
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          marginLeft: "250px",
        }}
        className="min-vh-100"
      >

        {/* Navbar */}
        <nav className="navbar bg-white border-bottom px-3 px-md-4 py-3">

          <div className="d-flex align-items-center gap-3">

            <button
              className="btn btn-light d-md-none"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={21} />
            </button>

            <div>
              <h5 className="fw-bold mb-0">
                {activeTab === "dashboard" &&
                  "Receptionist Dashboard"}

                {activeTab === "appointments" &&
                  "Appointments"}

                {activeTab === "patients" &&
                  "Patients"}

                {activeTab === "billing" &&
                  "Billing"}
              </h5>

              <small className="text-muted">
                Welcome back, {receptionistName}
              </small>
            </div>

          </div>

          <div className="d-flex align-items-center gap-3">

            <button className="btn btn-light position-relative">
              <Bell size={19} />

              {pendingBills.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {pendingBills.length}
                </span>
              )}
            </button>

            <button
              className="btn btn-light"
              onClick={loadAllData}
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

          </div>

        </nav>

        <div className="p-3 p-md-4">

          {/* Alerts */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2">
              <AlertCircle size={19} />
              <span>{error}</span>

              <button
                className="btn-close ms-auto"
                onClick={() => setError("")}
              />
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2">
              <CheckCircle size={19} />
              <span>{success}</span>

              <button
                className="btn-close ms-auto"
                onClick={() => setSuccess("")}
              />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm text-primary me-2" />
              Loading...
            </div>
          )}

          {/* =====================================================
              DASHBOARD
          ====================================================== */}
          {activeTab === "dashboard" && (
            <>

              <div className="mb-4">
                <h4 className="fw-bold">
                  Good morning, {receptionistName} 👋
                </h4>

                <p className="text-muted">
                  Manage patients, appointments and billing.
                </p>
              </div>

              <div className="row g-3 mb-4">

                <StatCard
                  title="Today's Appointments"
                  value={todayAppointments.length}
                  icon={<CalendarDays />}
                  color="primary"
                />

                <StatCard
                  title="Total Patients"
                  value={patients.length}
                  icon={<Users />}
                  color="success"
                />

                <StatCard
                  title="Checked In"
                  value={checkedInCount}
                  icon={<UserCheck />}
                  color="info"
                />

                <StatCard
                  title="Pending Bills"
                  value={pendingBills.length}
                  icon={<Receipt />}
                  color="warning"
                />

              </div>

              <div className="row g-4">

                <div className="col-lg-8">

                  <div className="card border-0 shadow-sm">

                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center mb-3">

                        <div>
                          <h5 className="fw-bold mb-1">
                            Today's Appointments
                          </h5>

                          <small className="text-muted">
                            {todayAppointments.length} appointment(s)
                          </small>
                        </div>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            navigateTab("appointments")
                          }
                        >
                          View All
                        </button>

                      </div>

                      {todayAppointments.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          No appointments for today.
                        </div>
                      ) : (
                        <div className="table-responsive">

                          <table className="table align-middle">

                            <thead>
                              <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Time</th>
                                <th>Status</th>
                              </tr>
                            </thead>

                            <tbody>
                              {todayAppointments
                                .slice(0, 6)
                                .map((appointment) => (
                                  <tr key={appointment.id}>

                                    <td>
                                      <div className="fw-semibold">
                                        {appointment.patient_name}
                                      </div>

                                      <small className="text-muted">
                                        {appointment.patient}
                                      </small>
                                    </td>

                                    <td>
                                      {appointment.doctor_name}
                                    </td>

                                    <td>
                                      {formatTime(
                                        appointment.appointment_time
                                      )}
                                    </td>

                                    <td>
                                      <span
                                        className={statusBadge(
                                          appointment.status
                                        )}
                                      >
                                        {appointment.status}
                                      </span>
                                    </td>

                                  </tr>
                                ))}
                            </tbody>

                          </table>
                        </div>
                      )}

                    </div>
                  </div>

                </div>

                <div className="col-lg-4">

                  <div className="card border-0 shadow-sm">

                    <div className="card-body">

                      <h5 className="fw-bold mb-3">
                        Quick Actions
                      </h5>

                      <div className="d-grid gap-2">

                        <button
                          className="btn btn-primary py-2"
                          onClick={openPatientModal}
                        >
                          <UserPlus
                            size={18}
                            className="me-2"
                          />
                          Register Patient
                        </button>

                        <button
                          className="btn btn-outline-primary py-2"
                          onClick={openAppointmentModal}
                        >
                          <CalendarDays
                            size={18}
                            className="me-2"
                          />
                          New Appointment
                        </button>

                        <button
                          className="btn btn-outline-warning py-2"
                          onClick={() =>
                            navigateTab("billing")
                          }
                        >
                          <Receipt
                            size={18}
                            className="me-2"
                          />
                          View Billing
                        </button>

                      </div>

                    </div>
                  </div>

                </div>

              </div>
            </>
          )}

          {/* =====================================================
              APPOINTMENTS
          ====================================================== */}
          {activeTab === "appointments" && (
            <div className="card border-0 shadow-sm">

              <div className="card-body">

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">

                  <div>
                    <h5 className="fw-bold mb-1">
                      Appointment Management
                    </h5>

                    <small className="text-muted">
                      Create appointments and check in patients.
                    </small>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={openAppointmentModal}
                  >
                    <Plus size={18} className="me-2" />
                    New Appointment
                  </button>

                </div>

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Token</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>

                      {appointments.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center text-muted py-5"
                          >
                            No appointments found.
                          </td>
                        </tr>
                      ) : (
                        appointments.map((appointment) => (
                          <tr key={appointment.id}>

                            <td>
                              <div className="fw-semibold">
                                {appointment.patient_name}
                              </div>

                              <small className="text-muted">
                                {appointment.patient}
                              </small>
                            </td>

                            <td>
                              {appointment.doctor_name}
                            </td>

                            <td>
                              {formatDate(
                                appointment.appointment_date
                              )}
                            </td>

                            <td>
                              {formatTime(
                                appointment.appointment_time
                              )}
                            </td>

                            <td>
                              <span
                                className={statusBadge(
                                  appointment.status
                                )}
                              >
                                {appointment.status}
                              </span>
                            </td>

                            <td>
                              {appointment.token_number ||
                                "-"}
                            </td>

                            <td>

                              {appointment.status ===
                                "BOOKED" ||
                                appointment.status ===
                                  "TOKEN_PENDING" ? (
                                <div className="d-flex gap-1">

                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() =>
                                      openBill(
                                        appointment
                                      )
                                    }
                                  >
                                    <Receipt size={15} />
                                  </button>

                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() =>
                                      handleCheckIn(
                                        appointment
                                      )
                                    }
                                    title="Check In"
                                  >
                                    <UserCheck
                                      size={15}
                                    />
                                  </button>

                                </div>
                              ) : appointment.status ===
                                "CHECKED_IN" ? (
                                <span className="text-success small fw-semibold">
                                  ✓ Checked In
                                </span>
                              ) : (
                                <span className="text-muted small">
                                  No action
                                </span>
                              )}

                            </td>

                          </tr>
                        ))
                      )}

                    </tbody>
                  </table>

                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              PATIENTS
          ====================================================== */}
          {activeTab === "patients" && (
            <div className="card border-0 shadow-sm">

              <div className="card-body">

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">

                  <div>
                    <h5 className="fw-bold mb-1">
                      Patient Management
                    </h5>

                    <small className="text-muted">
                      Register and search patients.
                    </small>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={openPatientModal}
                  >
                    <UserPlus
                      size={18}
                      className="me-2"
                    />
                    Register Patient
                  </button>

                </div>

                <div className="input-group mb-4">

                  <span className="input-group-text">
                    <Search size={18} />
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by patient ID, name or phone..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                  />

                </div>

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Phone</th>
                        <th>Registered</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-muted py-5"
                          >
                            No patients found.
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map((patient) => (
                          <tr key={patient.id}>

                            <td>
                              <span className="fw-bold text-primary">
                                {patient.patient_id}
                              </span>
                            </td>

                            <td>
                              <div className="fw-semibold">
                                {patient.full_name}
                              </div>

                              <small className="text-muted">
                                {patient.email || "-"}
                              </small>
                            </td>

                            <td>
                              {patient.age} years
                            </td>

                            <td>
                              {patient.gender}
                            </td>

                            <td>
                              {patient.phone}
                            </td>

                            <td>
                              {formatDate(
                                patient.registered_at
                              )}
                            </td>

                          </tr>
                        ))
                      )}

                    </tbody>
                  </table>

                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              BILLING
          ====================================================== */}
          {activeTab === "billing" && (
            <div className="card border-0 shadow-sm">

              <div className="card-body">

                <div className="mb-4">
                  <h5 className="fw-bold mb-1">
                    Billing Management
                  </h5>

                  <small className="text-muted">
                    Create OPD bills and collect payments.
                  </small>
                </div>

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead>
                      <tr>
                        <th>Bill Number</th>
                        <th>Patient</th>
                        <th>Type</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Payment</th>
                      </tr>
                    </thead>

                    <tbody>

                      {bills.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-muted py-5"
                          >
                            No bills found.
                          </td>
                        </tr>
                      ) : (
                        bills.map((bill) => (
                          <tr key={bill.id}>

                            <td className="fw-semibold">
                              {bill.bill_number}
                            </td>

                            <td>
                              {bill.patient_name ||
                                getPatientName(
                                  bill.patient
                                )}
                            </td>

                            <td>
                              {bill.bill_type}
                            </td>

                            <td className="fw-bold">
                              ₹
                              {Number(
                                bill.total_amount || 0
                              ).toFixed(2)}
                            </td>

                            <td>
                              <span
                                className={
                                  bill.payment_status ===
                                  "PAID"
                                    ? "badge text-bg-success"
                                    : "badge text-bg-warning"
                                }
                              >
                                {bill.payment_status}
                              </span>
                            </td>

                            <td>

                              {bill.payment_status ===
                              "PENDING" ? (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => {
                                    setSelectedBill(
                                      bill
                                    );
                                    setSelectedAppointment(
                                      null
                                    );
                                    setShowBillModal(
                                      true
                                    );
                                  }}
                                >
                                  <CreditCard
                                    size={15}
                                    className="me-1"
                                  />
                                  Pay
                                </button>
                              ) : (
                                <span className="text-success fw-semibold small">
                                  ✓ Paid
                                </span>
                              )}

                            </td>

                          </tr>
                        ))
                      )}

                    </tbody>

                  </table>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* =====================================================
          PATIENT MODAL
      ====================================================== */}
      {showPatientModal && (
        <Modal
          title="Register New Patient"
          onClose={() =>
            setShowPatientModal(false)
          }
        >
          <form onSubmit={handleRegisterPatient}>

            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">
                  First Name *
                </label>

                <input
                  name="first_name"
                  className="form-control"
                  value={patientForm.first_name}
                  onChange={handlePatientChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Last Name *
                </label>

                <input
                  name="last_name"
                  className="form-control"
                  value={patientForm.last_name}
                  onChange={handlePatientChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Date of Birth *
                </label>

                <input
                  type="date"
                  name="date_of_birth"
                  className="form-control"
                  value={patientForm.date_of_birth}
                  onChange={handlePatientChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Gender *
                </label>

                <select
                  name="gender"
                  className="form-select"
                  value={patientForm.gender}
                  onChange={handlePatientChange}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Blood Group
                </label>

                <select
                  name="blood_group"
                  className="form-select"
                  value={patientForm.blood_group}
                  onChange={handlePatientChange}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Phone *
                </label>

                <input
                  name="phone"
                  className="form-control"
                  value={patientForm.phone}
                  onChange={handlePatientChange}
                  maxLength="10"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={patientForm.email}
                  onChange={handlePatientChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Next Visit Date
                </label>

                <input
                  type="date"
                  name="next_visit_date"
                  className="form-control"
                  value={patientForm.next_visit_date}
                  onChange={handlePatientChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  Address *
                </label>

                <textarea
                  name="address"
                  className="form-control"
                  rows="2"
                  value={patientForm.address}
                  onChange={handlePatientChange}
                  required
                />
              </div>

            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">

              <button
                type="button"
                className="btn btn-light"
                onClick={() =>
                  setShowPatientModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={patientSaving}
              >
                {patientSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus
                      size={17}
                      className="me-2"
                    />
                    Register Patient
                  </>
                )}
              </button>

            </div>

          </form>
        </Modal>
      )}

      {/* =====================================================
          APPOINTMENT MODAL
      ====================================================== */}
      {showAppointmentModal && (
        <Modal
          title="Create New Appointment"
          onClose={() =>
            setShowAppointmentModal(false)
          }
        >
          <form onSubmit={handleCreateAppointment}>

            <div className="row g-3">

              <div className="col-12">
                <label className="form-label">
                  Patient *
                </label>

                <select
                  name="patient"
                  className="form-select"
                  value={appointmentForm.patient}
                  onChange={handleAppointmentChange}
                  required
                >
                  <option value="">
                    Select patient
                  </option>

                  {patients.map((patient) => (
                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.patient_id} -{" "}
                      {patient.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">
                  Doctor *
                </label>

                <select
                  name="doctor"
                  className="form-select"
                  value={appointmentForm.doctor}
                  onChange={handleAppointmentChange}
                  required
                >
                  <option value="">
                    Select doctor
                  </option>

                  {doctors.map((doctor) => (
                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >
                      {getDoctorName(doctor)}
                      {doctor.staff_id
                        ? ` (${doctor.staff_id})`
                        : ""}
                    </option>
                  ))}
                </select>

                {doctors.length === 0 && (
                  <small className="text-danger">
                    No doctors loaded. Check your staff
                    doctor API endpoint.
                  </small>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Appointment Date *
                </label>

                <input
                  type="date"
                  name="appointment_date"
                  className="form-control"
                  value={
                    appointmentForm.appointment_date
                  }
                  min={today}
                  onChange={handleAppointmentChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Available Time *
                </label>

                <select
                  name="appointment_time"
                  className="form-select"
                  value={
                    appointmentForm.appointment_time
                  }
                  onChange={handleAppointmentChange}
                  disabled={
                    !appointmentForm.doctor ||
                    !appointmentForm.appointment_date ||
                    loadingSlots
                  }
                  required
                >
                  <option value="">
                    {loadingSlots
                      ? "Loading slots..."
                      : "Select time"}
                  </option>

                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatTime(slot)}
                    </option>
                  ))}
                </select>

                {!loadingSlots &&
                  appointmentForm.doctor &&
                  appointmentForm.appointment_date &&
                  availableSlots.length === 0 && (
                    <small className="text-muted">
                      No available slots for this date.
                    </small>
                  )}
              </div>

              <div className="col-12">
                <label className="form-label">
                  Reason / Complaint
                </label>

                <textarea
                  name="reason"
                  className="form-control"
                  rows="3"
                  placeholder="Enter reason for visit..."
                  value={appointmentForm.reason}
                  onChange={handleAppointmentChange}
                />
              </div>

            </div>

            <div className="alert alert-info mt-3 small">
              <Clock
                size={16}
                className="me-2"
              />
              Only the doctor's available 15-minute
              slots are shown.
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">

              <button
                type="button"
                className="btn btn-light"
                onClick={() =>
                  setShowAppointmentModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={appointmentSaving}
              >
                {appointmentSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CalendarDays
                      size={17}
                      className="me-2"
                    />
                    Create Appointment
                  </>
                )}
              </button>

            </div>

          </form>
        </Modal>
      )}

      {/* =====================================================
          BILL / PAYMENT MODAL
      ====================================================== */}
      {showBillModal && selectedBill && (
        <Modal
          title="OPD Billing & Payment"
          onClose={() =>
            setShowBillModal(false)
          }
        >

          {selectedAppointment && (
            <div className="alert alert-light border">

              <div className="fw-bold">
                {selectedAppointment.patient_name}
              </div>

              <small className="text-muted">
                {selectedAppointment.doctor_name}
                {" • "}
                {formatDate(
                  selectedAppointment.appointment_date
                )}
                {" • "}
                {formatTime(
                  selectedAppointment.appointment_time
                )}
              </small>

            </div>
          )}

          <div className="border rounded-3 p-3">

            <div className="d-flex justify-content-between mb-2">
              <span>Bill Number</span>
              <strong>
                {selectedBill.bill_number}
              </strong>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Registration Fee</span>
              <span>
                ₹
                {Number(
                  selectedBill.registration_fee || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span>Consultation Fee</span>
              <span>
                ₹
                {Number(
                  selectedBill.consultation_fee || 0
                ).toFixed(2)}
              </span>
            </div>

            <hr />

            <div className="d-flex justify-content-between">
              <strong>Total</strong>

              <strong className="text-primary fs-5">
                ₹
                {Number(
                  selectedBill.total_amount || 0
                ).toFixed(2)}
              </strong>
            </div>

          </div>

          {selectedBill.payment_status ===
          "PENDING" ? (
            <>
              <div className="mt-4">

                <label className="form-label fw-semibold">
                  Payment Method
                </label>

                <div className="d-flex gap-2">

                  <button
                    type="button"
                    className={`btn flex-fill ${
                      paymentMethod === "CASH"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() =>
                      setPaymentMethod("CASH")
                    }
                  >
                    Cash
                  </button>

                  <button
                    type="button"
                    className={`btn flex-fill ${
                      paymentMethod === "GPAY"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() =>
                      setPaymentMethod("GPAY")
                    }
                  >
                    GPay
                  </button>

                </div>

              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">

                <button
                  className="btn btn-light"
                  onClick={() =>
                    setShowBillModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={payBill}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard
                        size={17}
                        className="me-2"
                      />
                      Pay ₹
                      {Number(
                        selectedBill.total_amount || 0
                      ).toFixed(2)}
                    </>
                  )}
                </button>

              </div>
            </>
          ) : (
            <div className="alert alert-success mt-4 mb-0">
              <CheckCircle
                size={18}
                className="me-2"
              />
              Payment completed successfully.
            </div>
          )}

        </Modal>
      )}

      {/* Responsive */}
      <style>
        {`
          @media (max-width: 767.98px) {
            main {
              margin-left: 0 !important;
            }
          }
        `}
      </style>

    </div>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <div className="col-12 col-sm-6 col-lg-3">

      <div className="card border-0 shadow-sm h-100">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center">

            <div>
              <small className="text-muted">
                {title}
              </small>

              <h3 className="fw-bold mt-2 mb-0">
                {value}
              </h3>
            </div>

            <div className={`text-${color}`}>
              {React.cloneElement(icon, {
                size: 28,
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

// ============================================================
// MODAL
// ============================================================

const Modal = ({
  title,
  children,
  onClose,
}) => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
      style={{
        zIndex: 2000,
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg w-100"
        style={{
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >

        <div className="d-flex justify-content-between align-items-center border-bottom p-3 p-md-4">

          <h5 className="fw-bold mb-0">
            {title}
          </h5>

          <button
            className="btn btn-light"
            onClick={onClose}
          >
            <X size={19} />
          </button>

        </div>

        <div className="p-3 p-md-4">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Receptionist;