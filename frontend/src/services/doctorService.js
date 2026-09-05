import api from "./api";

const doctorService = {
  // Doctor Queue
  getDoctorQueue: async (appointmentDate = "") => {
    const params =
      appointmentDate && appointmentDate !== "ALL"
        ? { appointment_date: appointmentDate }
        : {};
    const response = await api.get("/appointments/doctor-queue/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  // Appointments
  getAppointments: async (filters = {}) => {
    const response = await api.get("/appointments/", { params: filters });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await api.patch(`/appointments/${appointmentId}/`, { status });
    return response.data;
  },

  // Consultations
  getConsultations: async (patientId = "") => {
    const params = patientId ? { patient_id: patientId } : {};
    const response = await api.get("/consultations/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getConsultationDetail: async (id) => {
    const response = await api.get(`/consultations/${id}/`);
    return response.data;
  },

  createConsultation: async (consultationData) => {
    const response = await api.post("/consultations/", consultationData);
    return response.data;
  },

  updateConsultation: async (id, consultationData) => {
    const response = await api.put(`/consultations/${id}/`, consultationData);
    return response.data;
  },

  // Prescriptions
  getPrescriptions: async () => {
    const response = await api.get("/prescriptions/");
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getPrescriptionDetail: async (id) => {
    const response = await api.get(`/prescriptions/${id}/`);
    return response.data;
  },

  createPrescription: async (prescriptionData) => {
    const response = await api.post("/prescriptions/", prescriptionData);
    return response.data;
  },

  // Pharmacy Medicines & Lab Tests
  getMedicines: async () => {
    const response = await api.get("/pharmacy/medicines/");
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getLabTests: async () => {
    const response = await api.get("/laboratory/tests/");
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  // Patients & Patient History
  getPatients: async (search = "") => {
    const params = search ? { search } : {};
    const response = await api.get("/patients/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getPatientHistory: async (patientId) => {
    const [consultationsRes, prescriptionsRes] = await Promise.all([
      api.get("/consultations/", { params: { patient_id: patientId } }).catch(() => ({ data: [] })),
      api.get("/prescriptions/").catch(() => ({ data: [] })),
    ]);

    const consultations = Array.isArray(consultationsRes.data)
      ? consultationsRes.data
      : consultationsRes.data.results || [];

    const allPrescriptions = Array.isArray(prescriptionsRes.data)
      ? prescriptionsRes.data
      : prescriptionsRes.data.results || [];

    const prescriptions = allPrescriptions.filter(
      (p) => String(p.patient) === String(patientId) || p.patient?.patient_id === patientId
    );

    return {
      consultations,
      prescriptions,
    };
  },

  // Doctor Availability
  getDoctorAvailability: async () => {
    const response = await api.get("/staff/doctor-availability/");
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },
};

export default doctorService;
