import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const pharmacyService = {
  getMedicines: async () => {
    const response = await axios.get(`${API_URL}/medicines/`);
    return response.data;
  },

  getMedicine: async (id) => {
    const response = await axios.get(`${API_URL}/medicines/${id}/`);
    return response.data;
  },

  addMedicine: async (medicineData) => {
    const response = await axios.post(
      `${API_URL}/medicines/`,
      medicineData
    );
    return response.data;
  },

  updateMedicine: async (id, medicineData) => {
    const response = await axios.put(
      `${API_URL}/medicines/${id}/`,
      medicineData
    );
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await axios.delete(
      `${API_URL}/medicines/${id}/`
    );
    return response.data;
  },

  getPrescriptions: async () => {
    const response = await axios.get(
      `${API_URL}/prescriptions/`
    );
    return response.data;
  },

  getPrescription: async (id) => {
    const response = await axios.get(
      `${API_URL}/prescriptions/${id}/`
    );
    return response.data;
  },

  dispenseMedicine: async (data) => {
    const response = await axios.post(
      `${API_URL}/dispense/`,
      data
    );
    return response.data;
  },
};

export default pharmacyService;