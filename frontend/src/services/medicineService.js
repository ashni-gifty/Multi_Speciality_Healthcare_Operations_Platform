import api from "./api";

export const medicineService = {
  // Get all medicines with optional filters
  getMedicines: async (params = {}) => {
    const response = await api.get("/pharmacy/medicines/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  // Get medicine by ID
  getMedicineById: async (id) => {
    const response = await api.get(`/pharmacy/medicines/${id}/`);
    return response.data;
  },

  // Create new medicine in master
  createMedicine: async (medData) => {
    const response = await api.post("/pharmacy/medicines/", medData);
    return response.data;
  },

  // Update existing medicine
  updateMedicine: async (id, medData) => {
    const response = await api.put(`/pharmacy/medicines/${id}/`, medData);
    return response.data;
  },

  // Partial update
  patchMedicine: async (id, partialData) => {
    const response = await api.patch(`/pharmacy/medicines/${id}/`, partialData);
    return response.data;
  },

  // Deactivate or remove from active inventory
  deactivateMedicine: async (id) => {
    const response = await api.delete(`/pharmacy/medicines/${id}/`);
    return response.data;
  },
};

export default medicineService;
