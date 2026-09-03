import api from "./api";

/**
 * Calculates exact age in years from a date of birth string (YYYY-MM-DD)
 */
export const calculateAge = (dobString) => {
  if (!dobString) return "";
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

export const staffService = {
  // Get all staff members
  getStaff: async (params = {}) => {
    const response = await api.get("/staff/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  // Get single staff profile
  getStaffById: async (staffId) => {
    const response = await api.get(`/staff/${staffId}/`);
    return response.data;
  },

  // Create new staff profile and user credentials
  createStaff: async (staffData) => {
    const response = await api.post("/staff/", staffData);
    return response.data;
  },

  // Update existing staff profile
  updateStaff: async (staffId, staffData) => {
    const response = await api.put(`/staff/${staffId}/`, staffData);
    return response.data;
  },

  // Partial update
  patchStaff: async (staffId, partialData) => {
    const response = await api.patch(`/staff/${staffId}/`, partialData);
    return response.data;
  },

  // Deactivate staff member (soft delete)
  deactivateStaff: async (staffId) => {
    const response = await api.delete(`/staff/${staffId}/`);
    return response.data;
  },

  // Get department list
  getDepartments: async (includeInactive = false) => {
    const response = await api.get("/departments/", {
      params: includeInactive ? { include_inactive: "true" } : {},
    });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  createDepartment: async (departmentData) => {
    const response = await api.post("/departments/", departmentData);
    return response.data;
  },

  updateDepartment: async (departmentId, departmentData) => {
    const response = await api.put(`/departments/${departmentId}/`, departmentData);
    return response.data;
  },

  deactivateDepartment: async (departmentId) => {
    const response = await api.delete(`/departments/${departmentId}/`);
    return response.data;
  },
};

export default staffService;
