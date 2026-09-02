import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const reportService = {
  getDailyReport: async (date) => {
    const response = await axios.get(
      `${API_URL}/reports/daily/`,
      {
        params: { date },
      }
    );

    return response.data;
  },

  getWeeklyReport: async (startDate, endDate) => {
    const response = await axios.get(
      `${API_URL}/reports/weekly/`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    );

    return response.data;
  },

  getMonthlyReport: async (month) => {
    const response = await axios.get(
      `${API_URL}/reports/monthly/`,
      {
        params: { month },
      }
    );

    return response.data;
  },
};

export default reportService;