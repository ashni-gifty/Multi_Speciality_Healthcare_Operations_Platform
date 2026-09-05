import api from "./api";

const pharmacyService = {
  // Medicines Master
  getMedicines: async (params = {}) => {
    const response = await api.get("/pharmacy/medicines/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getMedicine: async (id) => {
    const response = await api.get(`/pharmacy/medicines/${id}/`);
    return response.data;
  },

  addMedicine: async (medicineData) => {
    const response = await api.post("/pharmacy/medicines/", medicineData);
    return response.data;
  },

  updateMedicine: async (id, medicineData) => {
    const response = await api.put(`/pharmacy/medicines/${id}/`, medicineData);
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await api.delete(`/pharmacy/medicines/${id}/`);
    return response.data;
  },

  // Stock Batches
  getStocks: async (params = {}) => {
    const response = await api.get("/pharmacy/stocks/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  addStock: async (stockData) => {
    const response = await api.post("/pharmacy/stocks/", stockData);
    return response.data;
  },

  updateStock: async (id, stockData) => {
    const response = await api.put(`/pharmacy/stocks/${id}/`, stockData);
    return response.data;
  },

  deleteStock: async (id) => {
    const response = await api.delete(`/pharmacy/stocks/${id}/`);
    return response.data;
  },

  // Prescriptions from Doctors
  getPrescriptions: async () => {
    const response = await api.get("/prescriptions/");
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getPrescription: async (id) => {
    const response = await api.get(`/prescriptions/${id}/`);
    return response.data;
  },

  // Dispensation
  dispensePrescription: async (prescriptionId, data = { payment_method: "CASH" }) => {
    const response = await api.post(`/pharmacy/prescriptions/${prescriptionId}/dispense/`, data);
    return response.data;
  },

  // Pharmacy Bills
  getBills: async (params = {}) => {
    const response = await api.get("/pharmacy/bills/", { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  getBill: async (id) => {
    const response = await api.get(`/pharmacy/bills/${id}/`);
    return response.data;
  },

  payBill: async (id, paymentData = { payment_method: "CASH" }) => {
    const response = await api.post(`/pharmacy/bills/${id}/pay/`, paymentData);
    return response.data;
  },

  // Reports
  getSalesReport: async (period = "daily") => {
    const response = await api.get("/pharmacy/reports/sales/", { params: { period } });
    return response.data;
  },
};

export default pharmacyService;