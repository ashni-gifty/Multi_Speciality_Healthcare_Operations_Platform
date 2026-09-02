import React, { useEffect, useState } from "react";
import pharmacyService from "../../services/pharmacyService";

function PharmacyDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const medicineData =
        await pharmacyService.getMedicines();

      const prescriptionData =
        await pharmacyService.getPrescriptions();

      setMedicines(medicineData);
      setPrescriptions(prescriptionData);
    } catch (error) {
      console.error(error);
    }
  };

  const lowStock = medicines.filter(
    (medicine) =>
      Number(medicine.number_of_units) > 0 &&
      Number(medicine.number_of_units) <= 10
  );

  const outOfStock = medicines.filter(
    (medicine) =>
      Number(medicine.number_of_units) === 0
  );

  const dispensed = prescriptions.filter(
    (prescription) => prescription.status === "Dispensed"
  );

  return (
    <div className="container-fluid p-4">

      <h2 className="mb-4">
        Pharmacy Dashboard
      </h2>

      <div className="row">

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3">
            <h6>Total Medicines</h6>
            <h2>{medicines.length}</h2>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3">
            <h6>Low Stock</h6>
            <h2>{lowStock.length}</h2>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3">
            <h6>Out of Stock</h6>
            <h2>{outOfStock.length}</h2>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3">
            <h6>Dispensed Prescriptions</h6>
            <h2>{dispensed.length}</h2>
          </div>
        </div>

      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header">
          <h5>Low Stock Medicines</h5>
        </div>

        <div className="table-responsive">

          <table className="table table-bordered mb-0">

            <thead>
              <tr>
                <th>Medicine ID</th>
                <th>Name</th>
                <th>Units</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {lowStock.map((medicine) => (
                <tr key={medicine.id}>

                  <td>{medicine.id}</td>

                  <td>
                    {medicine.medicine_name}
                  </td>

                  <td>
                    {medicine.number_of_units}
                  </td>

                  <td>
                    <span className="badge bg-warning">
                      Low Stock
                    </span>
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

export default PharmacyDashboard;