import api from "./api";

const receptionistService = {
  // Patients
  getPatients: async (search = "") => {
    const params = search ? { search } : {};
    const response = await api.get("/patients/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getPatient: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/`);
    return response.data;
  },

  createPatient: async (patientData) => {
    const response = await api.post("/patients/", patientData);
    return response.data;
  },

  updatePatient: async (patientId, patientData) => {
    const response = await api.put(`/patients/${patientId}/`, patientData);
    return response.data;
  },

  // Doctors & Availability
  getDoctors: async () => {
    const response = await api.get("/staff/doctors/");
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getDoctorAvailability: async (doctorId) => {
    const params = doctorId ? { doctor_id: doctorId } : {};
    const response = await api.get("/staff/doctor-availability/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get("/appointments/available-slots/", {
      params: { doctor: doctorId, date },
    });
    return response.data?.available_slots || [];
  },

  // Appointments
  getAppointments: async (filters = {}) => {
    const response = await api.get("/appointments/", { params: filters });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  createAppointment: async (appointmentData) => {
    const response = await api.post("/appointments/", appointmentData);
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await api.patch(`/appointments/${appointmentId}/`, { status });
    return response.data;
  },

  checkInAppointment: async (appointmentId, data = { payment_method: "CASH" }) => {
    const response = await api.post(`/appointments/${appointmentId}/check-in/`, data);
    return response.data;
  },

  // Billing & Payments
  getBills: async () => {
    const response = await api.get("/billing/bills/");
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  createBill: async (appointmentId) => {
    const response = await api.post(`/billing/appointments/${appointmentId}/create/`);
    return response.data;
  },

  payBill: async (billId, paymentData = { payment_method: "CASH" }) => {
    const response = await api.post(`/billing/bills/${billId}/pay/`, paymentData);
    return response.data;
  },
};

export default receptionistService;
