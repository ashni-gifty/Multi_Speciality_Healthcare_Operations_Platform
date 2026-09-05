export const value = (item, ...keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item[key] !== "") {
      return item[key];
    }
  }
  return "-";
};

export const money = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

export const medicineUnits = (medicine) => Number(value(medicine, "quantity", "number_of_units"));

export const medicineStatus = (medicine) => {
  const units = medicineUnits(medicine);
  if (value(medicine, "stock_status") === "EXPIRED") return "Expired";
  if (units === 0) return "Out of Stock";
  if (units <= Number(value(medicine, "reorder_level")) || units <= 10) return "Low Stock";
  return "In Stock";
};

export const statusClass = (status) => ({
  "Out of Stock": "bg-danger",
  "Low Stock": "bg-warning text-dark",
  Expired: "bg-dark",
  "In Stock": "bg-success",
  Dispensed: "bg-success",
  Pending: "bg-warning text-dark",
}[status] || "bg-secondary");

export const medicineLines = (medicines) => {
  if (Array.isArray(medicines)) return medicines;
  return String(medicines || "").split(/\n|,(?=\s*[A-Za-z])/).map((line) => line.trim()).filter(Boolean);
};