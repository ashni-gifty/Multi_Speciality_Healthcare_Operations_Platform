import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const billingService = {
  createBill: async (billData) => {
    const response = await axios.post(
      `${API_URL}/pharmacy-bills/`,
      billData
    );

    return response.data;
  },

  getBills: async () => {
    const response = await axios.get(
      `${API_URL}/pharmacy-bills/`
    );

    return response.data;
  },

  getBill: async (id) => {
    const response = await axios.get(
      `${API_URL}/pharmacy-bills/${id}/`
    );

    return response.data;
  },

  updatePaymentStatus: async (id, data) => {
    const response = await axios.patch(
      `${API_URL}/pharmacy-bills/${id}/`,
      data
    );

    return response.data;
  },
};

export default billingService;