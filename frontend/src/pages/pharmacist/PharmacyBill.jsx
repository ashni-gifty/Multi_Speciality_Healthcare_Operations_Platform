import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import billingService from "../../services/billingService";

function PharmacyBill() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [bill, setBill] = useState(null);

  useEffect(() => {
    loadBill();
  }, [id]);

  const loadBill = async () => {

    try {

      const data =
        await billingService.getBill(id);

      setBill(data);

    } catch (error) {

      console.error(error);

    }
  };

  if (!bill) {

    return (
      <div className="container p-4">
        Loading bill...
      </div>
    );

  }

  return (
    <div className="container p-4">

      <div className="d-flex justify-content-between mb-3">

        <h2>
          Pharmacy Bill
        </h2>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(
              `/pharmacist/bills/${id}/print`
            )
          }
        >
          Print Bill
        </button>

      </div>

      <div className="card shadow-sm">

        <div className="card-body">

          <div className="text-center">

            <h3>
              {bill.hospital_name}
            </h3>

            <p>
              Pharmacy Department
            </p>

          </div>

          <hr />

          <div className="row">

            <div className="col-md-6">

              <p>
                <strong>Patient Name:</strong>{" "}
                {bill.patient_name}
              </p>

              <p>
                <strong>Doctor:</strong>{" "}
                {bill.doctor_name}
              </p>

              <p>
                <strong>Patient Registration Date:</strong>{" "}
                {bill.patient_registration_date}
              </p>

            </div>

            <div className="col-md-6">

              <p>
                <strong>Serial Number:</strong>{" "}
                {bill.serial_number}
              </p>

              <p>
                <strong>Issued Date:</strong>{" "}
                {bill.issued_date}
              </p>

            </div>

          </div>

          <div className="table-responsive">

            <table className="table table-bordered">

              <thead>

                <tr>
                  <th>Medicine</th>
                  <th>Generic Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price / Unit</th>
                  <th>Total</th>
                </tr>

              </thead>

              <tbody>

                {bill.medicines?.map(
                  (medicine, index) => (

                    <tr key={index}>

                      <td>
                        {medicine.medicine_name}
                      </td>

                      <td>
                        {medicine.generic_name}
                      </td>

                      <td>
                        {medicine.type}
                      </td>

                      <td>
                        {medicine.quantity}
                      </td>

                      <td>
                        ₹{medicine.price_per_unit}
                      </td>

                      <td>
                        ₹{medicine.total}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          <div className="row justify-content-end">

            <div className="col-md-5">

              <table className="table">

                <tbody>

                  <tr>
                    <td>Grand Total</td>
                    <td>
                      ₹{bill.grand_total}
                    </td>
                  </tr>

                  <tr>
                    <td>GST</td>
                    <td>
                      ₹{bill.gst}
                    </td>
                  </tr>

                  <tr>
                    <th>Amount Payable</th>
                    <th>
                      ₹{bill.amount_payable}
                    </th>
                  </tr>

                  <tr>
                    <td>Payment Mode</td>
                    <td>
                      {bill.payment_mode}
                    </td>
                  </tr>

                  <tr>
                    <td>Paid Status</td>
                    <td>

                      <span className="badge bg-success">
                        {bill.paid_status
                          ? "Paid"
                          : "Pending"}
                      </span>

                    </td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PharmacyBill;