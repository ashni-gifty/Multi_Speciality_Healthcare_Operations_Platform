import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import billingService from "../../services/billingService";

function PharmacyBillPrint() {

  const { id } = useParams();

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
    return <p>Loading...</p>;
  }

  return (
    <div className="container p-5">

      <div className="text-center">

        <h2>
          {bill.hospital_name}
        </h2>

        <h4>
          Pharmacy Bill
        </h4>

      </div>

      <hr />

      <div className="row">

        <div className="col-md-6">

          <p>
            <strong>Patient:</strong>{" "}
            {bill.patient_name}
          </p>

          <p>
            <strong>Doctor:</strong>{" "}
            {bill.doctor_name}
          </p>

          <p>
            <strong>Registration Date:</strong>{" "}
            {bill.patient_registration_date}
          </p>

        </div>

        <div className="col-md-6">

          <p>
            <strong>Serial No:</strong>{" "}
            {bill.serial_number}
          </p>

          <p>
            <strong>Issued Date:</strong>{" "}
            {bill.issued_date}
          </p>

        </div>

      </div>

      <table className="table table-bordered">

        <thead>

          <tr>
            <th>Medicine</th>
            <th>Generic</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Price</th>
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

      <div className="text-end">

        <p>
          Grand Total: ₹{bill.grand_total}
        </p>

        <p>
          GST: ₹{bill.gst}
        </p>

        <h4>
          Amount Payable:
          ₹{bill.amount_payable}
        </h4>

        <p>
          Payment Mode:{" "}
          {bill.payment_mode}
        </p>

        <p>
          Status:{" "}
          {bill.paid_status
            ? "PAID"
            : "PENDING"}
        </p>

      </div>

      <div className="text-center mt-4">

        <button
          className="btn btn-primary"
          onClick={() => window.print()}
        >
          Print
        </button>

      </div>

    </div>
  );
}

export default PharmacyBillPrint;