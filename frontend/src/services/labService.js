import api from "./api";

export const LAB_STATUS = {
  PENDING_SAMPLE: "PENDING_SAMPLE",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
};

export const STAGE_CONFIG = {
  PENDING_SAMPLE: { label: "Pending Sample", badge: "bg-warning-subtle text-warning-emphasis", step: 1 },
  PROCESSING: { label: "In Processing", badge: "bg-primary-subtle text-primary", step: 2 },
  COMPLETED: { label: "Completed", badge: "bg-success-subtle text-success", step: 3 },
};

export const STATUS_CONFIG = STAGE_CONFIG;

/**
 * Helper to normalize API responses that might be paginated
 */
const handleResponse = (response) => {
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

const labService = {
  getReports: async (params = {}) => {
    const response = await api.get("/laboratory/reports/", { params });
    return handleResponse(response);
  },

  getReportById: async (id) => (await api.get(`/laboratory/reports/${id}/`)).data,

  createReport: async (reportData) => (await api.post("/laboratory/reports/", reportData)).data,

  updateReport: async (id, reportData) => (await api.put(`/laboratory/reports/${id}/`, reportData)).data,

  patchReport: async (id, partialData) => (await api.patch(`/laboratory/reports/${id}/`, partialData)).data,

  startProcessing: async (id) => 
    (await api.patch(`/reports/${id}/`, { status: LAB_STATUS.PROCESSING })).data,

  completeReport: async (id, { result_value = "", reference_range = "", finding_notes = "" } = {}) => 
    (await api.patch(`/reports/${id}/`, {
      status: LAB_STATUS.COMPLETED,
      result_value,
      reference_range,
      finding_notes,
    })).data,

  getLabTests: async () => handleResponse(await api.get("/laboratory/tests/")),

  createLabTest: async (testData) => (await api.post("/laboratory/tests/", testData)).data,

  getPatients: async (params = {}) => handleResponse(await api.get("/patients/", { params })),

  getDoctors: async () => {
    try {
      const response = await api.get("/staff/", { params: { role: "DOCTOR" } });
      return handleResponse(response);
    } catch (error) {
      console.error("Failed to load doctors:", error);
      return [];
    }
  },
};

export default labService;