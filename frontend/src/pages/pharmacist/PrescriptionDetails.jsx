import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import pharmacyService from "../../services/pharmacyService";

function PrescriptionDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [prescription, setPrescription] =
    useState(null);

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

  if (!prescription) {
    return (
      <div className="container p-4">
        Loading prescription...
      </div>
    );
  }

  return (
    <div className="container p-4">

      <h2 className="mb-4">
        Prescription Details
      </h2>

      <div className="card shadow-sm">

        <div className="card-body">

          <div className="row">

            <div className="col-md-6">

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

              <p>
                <strong>Prescription Date:</strong>{" "}
                {prescription.prescription_date}
              </p>

            </div>

            <div className="col-md-6">

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

            </div>

          </div>

          <hr />

          <button
            className="btn btn-success"
            onClick={() =>
              navigate(
                `/pharmacist/dispense/${prescription.id}`
              )
            }
          >
            Dispense Medicine
          </button>

        </div>

      </div>

    </div>
  );
}

export default PrescriptionDetails;