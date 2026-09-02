import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import pharmacyService from "../../services/pharmacyService";

function PrescriptionList() {

  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {

    try {

      const data =
        await pharmacyService.getPrescriptions();

      setPrescriptions(data);

    } catch (error) {

      console.error(error);

    }
  };

  const filtered = prescriptions.filter(
    (prescription) =>
      prescription.patient_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      prescription.patient_id
        ?.toString()
        .includes(search)
  );

  return (
    <div className="container-fluid p-4">

      <div className="d-flex justify-content-between mb-4">

        <h2>Prescription Management</h2>

        <input
          className="form-control"
          style={{ maxWidth: "300px" }}
          placeholder="Search patient..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      <div className="card shadow-sm">

        <div className="table-responsive">

          <table className="table table-bordered">

            <thead>

              <tr>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Prescription Date</th>
                <th>Medicines</th>
                <th>Dosage</th>
                <th>Duration</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filtered.map((prescription) => (

                <tr key={prescription.id}>

                  <td>
                    {prescription.patient_id}
                  </td>

                  <td>
                    {prescription.patient_name}
                  </td>

                  <td>
                    {prescription.doctor_name}
                  </td>

                  <td>
                    {prescription.prescription_date}
                  </td>

                  <td>
                    {prescription.medicines}
                  </td>

                  <td>
                    {prescription.dosage}
                  </td>

                  <td>
                    {prescription.duration}
                  </td>

                  <td>
                    {prescription.quantity}
                  </td>

                  <td>

                    <span
                      className={
                        prescription.status ===
                        "Dispensed"
                          ? "badge bg-success"
                          : "badge bg-warning text-dark"
                      }
                    >
                      {prescription.status ||
                        "Pending"}
                    </span>

                  </td>

                  <td>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate(
                          `/pharmacist/prescriptions/${prescription.id}`
                        )
                      }
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default PrescriptionList;