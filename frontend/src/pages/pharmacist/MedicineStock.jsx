import { useEffect, useState } from "react";
import pharmacyService from "../../services/pharmacyService";
import { medicineStatus, medicineUnits, money, statusClass, value } from "./pharmacyHelpers";

function MedicineStock() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { pharmacyService.getMedicines().then((data) => setMedicines(Array.isArray(data) ? data : data.results || [])).catch(console.error).finally(() => setLoading(false)); }, []);
  const filtered = medicines.filter((medicine) => ["name", "medicine_name", "generic_name", "batch_number", "medicine_id"].some((key) => String(medicine[key] || "").toLowerCase().includes(search.toLowerCase())));
  const columns = [["Medicine ID", (m) => value(m, "medicine_id", "id")], ["Medicine Name", (m) => value(m, "name", "medicine_name")], ["Generic Name", (m) => value(m, "generic_name")], ["Manufacturer", (m) => value(m, "manufacturer")], ["Supplier", (m) => value(m, "supplier")], ["Batch Number", (m) => value(m, "batch_number")], ["Manufacturing Date", (m) => value(m, "manufacturing_date", "manufactured_date")], ["Expiry Date", (m) => value(m, "expiry_date")], ["Price / Unit", (m) => money(value(m, "unit_price", "price_per_unit"))], ["Type", (m) => value(m, "category", "type")], ["Units", medicineUnits]];
  return <main className="container-fluid p-4"><div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><h2 className="mb-0">Medicine Stock</h2><input className="form-control" style={{ maxWidth: "320px" }} placeholder="Search name, ID or batch" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="card shadow-sm"><div className="table-responsive"><table className="table table-bordered table-hover align-middle mb-0"><thead className="table-light"><tr>{columns.map(([heading]) => <th key={heading}>{heading}</th>)}<th>Status</th></tr></thead><tbody>{loading ? <tr><td colSpan="12" className="text-center py-4">Loading medicines...</td></tr> : filtered.map((medicine) => <tr key={medicine.id}>{columns.map(([heading, render]) => <td key={heading}>{render(medicine)}</td>)}<td><span className={`badge ${statusClass(medicineStatus(medicine))}`}>{medicineStatus(medicine)}</span></td></tr>)}{!loading && !filtered.length && <tr><td colSpan="12" className="text-center text-muted py-4">No medicines match your search.</td></tr>}</tbody></table></div></div></main>;
}

export default MedicineStock;
