import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import pharmacyService from "../../services/pharmacyService";
import billingService from "../../services/billingService";

function DispenseMedicine() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [prescription, setPrescription] =
    useState(null);

  const [paymentMode, setPaymentMode] =
    useState("Cash");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadPrescription();
  }, [id]);

  const loadPrescription = async () => {

    try {

      const data =
        await pharmacyService.getPrescription(id);

      setPrescription(data);

    } catch (error) {

      console.error(error);

    }
  };

  const dispense = async () => {

    if (!prescription) return;

    setLoading(true);

    try {

      const dispenseData = {
        prescription_id: prescription.id,
        patient_id: prescription.patient_id,
        payment_mode: paymentMode
      };

      const dispenseResponse =
        await pharmacyService.dispenseMedicine(
          dispenseData
        );

      const billData = {
        patient_id: prescription.patient_id,
        prescription_id: prescription.id,
        payment_mode: paymentMode,
        medicines:
          dispenseResponse.medicines ||
          prescription.medicines,
      };

      const bill =
        await billingService.createBill(billData);

      alert(
        "Medicine dispensed and pharmacy bill created successfully."
      );

      navigate(
        `/pharmacist/bills/${bill.id}`
      );

    } catch (error) {

      console.error(error);

      alert(
        "Unable to dispense medicine."
      );

    } finally {

      setLoading(false);

    }
  };

  if (!prescription) {

    return (
      <div className="container p-4">
        Loading...
      </div>
    );

  }

  return (
    <div className="container p-4">

      <h2 className="mb-4">
        Dispense Medicine
      </h2>

      <div className="card shadow-sm">

        <div className="card-body">

          <h5>Patient Information</h5>

          <p>
            <strong>Patient ID:</strong>{" "}
            {prescription.patient_id}
          </p>

          <p>
            <strong>Patient Name:</strong>{" "}
            {prescription.patient_name}
          </p>

          <p>
            <strong>Doctor:</strong>{" "}
            {prescription.doctor_name}
          </p>

          <hr />

          <h5>Prescription</h5>

          <p>
            <strong>Medicines:</strong>{" "}
            {prescription.medicines}
          </p>

          <p>
            <strong>Dosage:</strong>{" "}
            {prescription.dosage}
          </p>

          <p>
            <strong>Duration:</strong>{" "}
            {prescription.duration}
          </p>

          <p>
            <strong>Quantity:</strong>{" "}
            {prescription.quantity}
          </p>

          <hr />

          <label className="form-label">
            Mode of Payment
          </label>

          <select
            className="form-select mb-4"
            value={paymentMode}
            onChange={(e) =>
              setPaymentMode(e.target.value)
            }
          >
            <option value="Cash">
              Cash
            </option>

            <option value="GPay">
              GPay
            </option>
          </select>

          <button
            className="btn btn-success"
            onClick={dispense}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : "Confirm Dispense"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default DispenseMedicine;