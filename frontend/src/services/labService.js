import api from "./api";

export const LAB_STAGES = {
  REQUEST_RECEIVED: "REQUEST_RECEIVED",
  SAMPLE_PENDING: "SAMPLE_PENDING",
  SAMPLE_COLLECTED: "SAMPLE_COLLECTED",
  PROCESSING: "PROCESSING",
  RESULT_READY: "RESULT_READY",
  VERIFIED: "VERIFIED",
  REPORTED: "REPORTED",
};

export const STAGE_CONFIG = {
  REQUEST_RECEIVED: { label: "Request Received", badge: "bg-secondary-subtle text-secondary", step: 1 },
  SAMPLE_PENDING: { label: "Sample Pending", badge: "bg-warning-subtle text-warning-emphasis", step: 2 },
  SAMPLE_COLLECTED: { label: "Sample Collected", badge: "bg-info-subtle text-info-emphasis", step: 3 },
  PROCESSING: { label: "Processing in Lab", badge: "bg-primary-subtle text-primary", step: 4 },
  RESULT_READY: { label: "Result Ready", badge: "bg-purple-subtle text-purple", step: 5 },
  VERIFIED: { label: "Verified & Approved", badge: "bg-teal-subtle text-teal-emphasis", step: 6 },
  REPORTED: { label: "Reported to Doctor", badge: "bg-success-subtle text-success", step: 7 },
};

export const labService = {
  // Get all laboratory test orders / reports
  getReports: async (params = {}) => {
    const response = await api.get("/laboratory/reports/", { params });
    const data = Array.isArray(response.data) ? response.data : response.data.results || [];
    return data;
  },

  // Get specific report by ID
  getReportById: async (id) => {
    const response = await api.get(`/laboratory/reports/${id}/`);
    return response.data;
  },

  // Create new lab test request
  createReport: async (reportData) => {
    const response = await api.post("/laboratory/reports/", reportData);
    return response.data;
  },

  // Update complete report
  updateReport: async (id, reportData) => {
    const response = await api.put(`/laboratory/reports/${id}/`, reportData);
    return response.data;
  },

  // Partial update (status transition, result values, notes)
  patchReport: async (id, partialData) => {
    const response = await api.patch(`/laboratory/reports/${id}/`, partialData);
    return response.data;
  },

  // Get catalog of all diagnostic lab tests master
  getLabTests: async () => {
    const response = await api.get("/laboratory/tests/");
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  // Create new diagnostic test in master catalog
  createLabTest: async (testData) => {
    const response = await api.post("/laboratory/tests/", testData);
    return response.data;
  },

  // Get patients list for requisition mapping
  getPatients: async (params = {}) => {
    const response = await api.get("/patients/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  // Get doctors list for ordering doctor selection
  getDoctors: async () => {
    try {
      const response = await api.get("/staff/", { params: { role: "DOCTOR" } });
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      return data.filter((s) => s.role === "DOCTOR");
    } catch {
      return [];
    }
  },
};

export default labService;
