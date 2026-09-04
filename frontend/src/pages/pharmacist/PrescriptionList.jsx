import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pharmacyService from "../../services/pharmacyService";
import { medicineLines, statusClass, value } from "./pharmacyHelpers";

function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => { pharmacyService.getPrescriptions().then((data) => setPrescriptions(Array.isArray(data) ? data : data.results || [])).catch(console.error); }, []);
  const filtered = prescriptions.filter((prescription) => `${value(prescription, "patient_id")} ${value(prescription, "patient_name")} ${value(prescription, "rx_id")}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="container-fluid p-4"><div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><h2 className="mb-0">Prescription Management</h2><input className="form-control" style={{ maxWidth: "320px" }} placeholder="Search patient or prescription" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="card shadow-sm"><div className="table-responsive"><table className="table table-bordered table-hover align-middle mb-0"><thead className="table-light"><tr><th>Patient ID</th><th>Patient Name</th><th>Doctor</th><th>Prescription Date</th><th>Medicines</th><th>Dosage</th><th>Duration</th><th>Quantity</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map((prescription) => { const status = prescription.status || "Pending"; return <tr key={prescription.id}><td>{value(prescription, "patient_id")}</td><td>{value(prescription, "patient_name")}</td><td>{value(prescription, "doctor_name", "doctor")}</td><td>{value(prescription, "date", "prescription_date")}</td><td>{medicineLines(prescription.medicines).map((line, index) => <div key={index}>{typeof line === "string" ? line : value(line, "medicine_name", "name")}</div>)}</td><td>{value(prescription, "dosage", "notes")}</td><td>{value(prescription, "duration")}</td><td>{value(prescription, "quantity")}</td><td><span className={`badge ${statusClass(status)}`}>{status}</span></td><td><Link className="btn btn-sm btn-outline-primary" to={`/pharmacist/prescriptions/${prescription.id}`}>View</Link></td></tr>; })}{!filtered.length && <tr><td colSpan="10" className="text-center text-muted py-4">No prescriptions found.</td></tr>}</tbody></table></div></div></main>;
}

export default PrescriptionList;
