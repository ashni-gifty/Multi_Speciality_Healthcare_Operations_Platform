import React, { useEffect, useState } from "react";
import pharmacyService from "../../services/pharmacyService";

function MedicineStock() {

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const data =
        await pharmacyService.getMedicines();

      setMedicines(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (units) => {

    if (Number(units) === 0) {
      return (
        <span className="badge bg-danger">
          Out of Stock
        </span>
      );
    }

    if (Number(units) <= 10) {
      return (
        <span className="badge bg-warning text-dark">
          Low Stock
        </span>
      );
    }

    return (
      <span className="badge bg-success">
        Available
      </span>
    );
  };

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.medicine_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      medicine.generic_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      medicine.batch_number
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid p-4">

      <div className="d-flex justify-content-between mb-4">

        <h2>Medicine Stock</h2>

        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "300px" }}
          placeholder="Search medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {loading ? (
        <p>Loading medicines...</p>
      ) : (

        <div className="card shadow-sm">

          <div className="table-responsive">

            <table className="table table-bordered table-hover">

              <thead className="table-light">

                <tr>
                  <th>Medicine ID</th>
                  <th>Medicine Name</th>
                  <th>Generic Name</th>
                  <th>Manufacturer</th>
                  <th>Supplier</th>
                  <th>Batch Number</th>
                  <th>Manufacturing Date</th>
                  <th>Expiry Date</th>
                  <th>Price / Unit</th>
                  <th>Type</th>
                  <th>Units</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {filteredMedicines.map((medicine) => (

                  <tr key={medicine.id}>

                    <td>{medicine.id}</td>

                    <td>
                      {medicine.medicine_name}
                    </td>

                    <td>
                      {medicine.generic_name}
                    </td>

                    <td>
                      {medicine.manufacturer}
                    </td>

                    <td>
                      {medicine.supplier}
                    </td>

                    <td>
                      {medicine.batch_number}
                    </td>

                    <td>
                      {medicine.manufacturing_date}
                    </td>

                    <td>
                      {medicine.expiry_date}
                    </td>

                    <td>
                      ₹{medicine.price_per_unit}
                    </td>

                    <td>
                      {medicine.type}
                    </td>

                    <td>
                      {medicine.number_of_units}
                    </td>

                    <td>
                      {getStatus(
                        medicine.number_of_units
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}

export default MedicineStock;