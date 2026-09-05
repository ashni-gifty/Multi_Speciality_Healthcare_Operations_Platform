import api from "./api";

const billingService = {
  createBill: async (billData) => {
    const response = await api.post("/pharmacy-bills/", billData);

    return response.data;
  },

  getBills: async () => {
    const response = await api.get("/pharmacy-bills/");

    return response.data;
  },

  getBill: async (id) => {
    const response = await api.get(`/pharmacy-bills/${id}/`);

    return response.data;
  },

  updatePaymentStatus: async (id, data) => {
    const response = await api.patch(`/pharmacy-bills/${id}/`, data);

    return response.data;
  },
};

export default billingService;