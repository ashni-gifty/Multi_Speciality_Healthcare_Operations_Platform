import React, { useState } from "react";
import reportService from "../../services/reportService";

function SalesReports() {

  const [reportType, setReportType] =
    useState("daily");

  const [date, setDate] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [month, setMonth] =
    useState("");

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const generateReport = async () => {

    try {

      setLoading(true);

      let data;

      if (reportType === "daily") {

        data =
          await reportService.getDailyReport(
            date
          );

      } else if (reportType === "weekly") {

        data =
          await reportService.getWeeklyReport(
            startDate,
            endDate
          );

      } else {

        data =
          await reportService.getMonthlyReport(
            month
          );

      }

      setReport(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="container-fluid p-4">

      <div className="d-flex justify-content-between">

        <h2>
          Pharmacy Sales Reports
        </h2>

        <button
          className="btn btn-secondary"
          onClick={() => window.print()}
        >
          Print Report
        </button>

      </div>

      <div className="card shadow-sm mt-4">

        <div className="card-body">

          <label className="form-label">
            Report Type
          </label>

          <select
            className="form-select mb-3"
            value={reportType}
            onChange={(e) =>
              setReportType(e.target.value)
            }
          >

            <option value="daily">
              Daily
            </option>

            <option value="weekly">
              Weekly
            </option>

            <option value="monthly">
              Monthly
            </option>

          </select>

          {reportType === "daily" && (

            <input
              type="date"
              className="form-control mb-3"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

          )}

          {reportType === "weekly" && (

            <div className="row">

              <div className="col-md-6">

                <label>
                  Start Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                />

              </div>

              <div className="col-md-6">

                <label>
                  End Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                />

              </div>

            </div>

          )}

          {reportType === "monthly" && (

            <input
              type="month"
              className="form-control mb-3"
              value={month}
              onChange={(e) =>
                setMonth(e.target.value)
              }
            />

          )}

          <button
            className="btn btn-primary mt-3"
            onClick={generateReport}
          >
            {loading
              ? "Generating..."
              : "Generate Report"}
          </button>

        </div>

      </div>

      {report && (

        <div className="card shadow-sm mt-4">

          <div className="card-body">

            <h4>
              {reportType.toUpperCase()} Sales Report
            </h4>

            <div className="row mt-3">

              <div className="col-md-4">

                <div className="card p-3">

                  <h6>Total Sales</h6>

                  <h3>
                    ₹{report.total_sales}
                  </h3>

                </div>

              </div>

              <div className="col-md-4">

                <div className="card p-3">

                  <h6>Total Bills</h6>

                  <h3>
                    {report.total_bills}
                  </h3>

                </div>

              </div>

              <div className="col-md-4">

                <div className="card p-3">

                  <h6>Medicines Sold</h6>

                  <h3>
                    {report.medicines_sold}
                  </h3>

                </div>

              </div>

            </div>

            <hr />

            <table className="table table-bordered mt-4">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Medicine</th>
                  <th>Quantity</th>
                  <th>Sales</th>
                </tr>

              </thead>

              <tbody>

                {report.details?.map(
                  (item, index) => (

                    <tr key={index}>

                      <td>
                        {item.date}
                      </td>

                      <td>
                        {item.medicine_name}
                      </td>

                      <td>
                        {item.quantity}
                      </td>

                      <td>
                        ₹{item.total}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}

export default SalesReports;