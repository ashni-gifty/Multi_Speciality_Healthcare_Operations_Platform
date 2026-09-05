import api from "./api";

const pharmacyService = {
  getMedicines: async () => {
    const response = await api.get("/medicines/");
    return response.data;
  },

  getMedicine: async (id) => {
    const response = await api.get(`/medicines/${id}/`);
    return response.data;
  },

  addMedicine: async (medicineData) => {
    const response = await api.post("/medicines/", medicineData);
    return response.data;
  },

  updateMedicine: async (id, medicineData) => {
    const response = await api.put(`/medicines/${id}/`, medicineData);
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await api.delete(`/medicines/${id}/`);
    return response.data;
  },

  getPrescriptions: async () => {
    const response = await api.get("/prescriptions/");
    return response.data;
  },

  getPrescription: async (id) => {
    const response = await api.get(`/prescriptions/${id}/`);
    return response.data;
  },

  dispenseMedicine: async (data) => {
    const response = await api.post("/dispense/", data);
    return response.data;
  },
};

export default pharmacyService;