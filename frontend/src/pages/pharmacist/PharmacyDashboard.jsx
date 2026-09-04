import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pharmacyService from "../../services/pharmacyService";
import { medicineStatus, medicineUnits, statusClass, value } from "./pharmacyHelpers";

function PharmacyDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([pharmacyService.getMedicines(), pharmacyService.getPrescriptions()])
      .then(([medicineData, prescriptionData]) => {
        setMedicines(Array.isArray(medicineData) ? medicineData : medicineData.results || []);
        setPrescriptions(Array.isArray(prescriptionData) ? prescriptionData : prescriptionData.results || []);
      }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const lowStock = medicines.filter((medicine) => medicineStatus(medicine) === "Low Stock");
  const outOfStock = medicines.filter((medicine) => medicineStatus(medicine) === "Out of Stock");
  const dispensed = prescriptions.filter((prescription) => prescription.status === "Dispensed");
  const stats = [["Total Medicines", medicines.length, "primary"], ["Low Stock", lowStock.length, "warning"], ["Out of Stock", outOfStock.length, "danger"], ["Dispensed", dispensed.length, "success"]];

  return <main className="container-fluid p-4">
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><div><p className="text-uppercase text-muted small mb-1">Pharmacy operations</p><h2 className="mb-0">Dashboard</h2></div><div className="d-flex gap-2"><Link className="btn btn-outline-primary" to="/pharmacist/medicines">Medicine stock</Link><Link className="btn btn-primary" to="/pharmacist/prescriptions">Prescriptions</Link></div></div>
    <div className="row g-3 mb-4">{stats.map(([label, count, color]) => <div className="col-sm-6 col-xl-3" key={label}><div className={`card border-start border-4 border-${color} shadow-sm h-100`}><div className="card-body"><p className="text-muted mb-2">{label}</p><h2 className="mb-0">{loading ? "..." : count}</h2></div></div></div>)}</div>
    <section className="card shadow-sm"><div className="card-header bg-white d-flex justify-content-between align-items-center"><h5 className="mb-0">Attention required</h5><Link to="/pharmacist/medicines">View all</Link></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Medicine ID</th><th>Name</th><th>Units</th><th>Status</th></tr></thead><tbody>{lowStock.concat(outOfStock).map((medicine) => <tr key={medicine.id}><td>{value(medicine, "medicine_id", "id")}</td><td>{value(medicine, "name", "medicine_name")}</td><td>{medicineUnits(medicine)}</td><td><span className={`badge ${statusClass(medicineStatus(medicine))}`}>{medicineStatus(medicine)}</span></td></tr>)}{!loading && !lowStock.length && !outOfStock.length && <tr><td colSpan="4" className="text-center text-muted py-4">All medicines are adequately stocked.</td></tr>}</tbody></table></div></section>
  </main>;
}

export default PharmacyDashboard;
