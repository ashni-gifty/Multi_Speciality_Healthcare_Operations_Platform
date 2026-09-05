import React from "react";
import { Pill, FlaskConical, Plus, Trash2, AlertCircle, Info, Sparkles } from "lucide-react";

const FREQUENCY_OPTIONS = [
  "1-0-1 (Twice daily after meals)",
  "1-1-1 (Thrice daily after meals)",
  "1-0-0 (Once daily morning)",
  "0-0-1 (Once daily night)",
  "1-0-1 Before meals",
  "SOS (As needed when pain/fever)",
  "Once a week",
  "As directed by physician",
];

const DURATION_OPTIONS = [
  "3 Days",
  "5 Days",
  "7 Days",
  "10 Days",
  "14 Days",
  "1 Month",
  "Ongoing / Continuous",
];

const PrescriptionForm = ({
  medicinesList = [],
  labTestsList = [],
  rxForm,
  setRxForm,
}) => {
  // Pharmacy Medicines handlers
  const addMedicine = () => {
    setRxForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicine: "",
          dosage: "500mg",
          frequency: "1-0-1 (Twice daily after meals)",
          duration: "5 Days",
          quantity: "10",
        },
      ],
    }));
  };

  const removeMedicine = (index) => {
    setRxForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const updateMedicine = (index, field, value) => {
    setRxForm((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  // External Medicines handlers
  const addExternalMedicine = () => {
    setRxForm((prev) => ({
      ...prev,
      external_medicines: [
        ...prev.external_medicines,
        {
          medicine_name: "",
          instructions: "",
        },
      ],
    }));
  };

  const removeExternalMedicine = (index) => {
    setRxForm((prev) => ({
      ...prev,
      external_medicines: prev.external_medicines.filter((_, i) => i !== index),
    }));
  };

  const updateExternalMedicine = (index, field, value) => {
    setRxForm((prev) => ({
      ...prev,
      external_medicines: prev.external_medicines.map((em, i) =>
        i === index ? { ...em, [field]: value } : em
      ),
    }));
  };

  // Lab Tests handlers
  const addLabTest = () => {
    setRxForm((prev) => ({
      ...prev,
      lab_tests: [
        ...prev.lab_tests,
        {
          test: "",
          notes: "Routine diagnostic check",
        },
      ],
    }));
  };

  const removeLabTest = (index) => {
    setRxForm((prev) => ({
      ...prev,
      lab_tests: prev.lab_tests.filter((_, i) => i !== index),
    }));
  };

  const updateLabTest = (index, field, value) => {
    setRxForm((prev) => ({
      ...prev,
      lab_tests: prev.lab_tests.map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      ),
    }));
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* SECTION 1: IN-HOUSE PHARMACY MEDICATIONS */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 bg-blue-subtle text-primary rounded-3">
                <Pill size={18} />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-slate-900">Hospital Pharmacy Prescriptions (Rx)</h6>
                <small className="text-muted">
                  Auto-routed to Dispensary FIFO counter & inventory deduction
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs"
              onClick={addMedicine}
            >
              <Plus size={14} /> Add Medicine
            </button>
          </div>

          {rxForm.medicines.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-3 text-center text-muted border border-slate-100">
              <Pill size={24} className="opacity-50 mb-1" />
              <div className="small fw-medium text-slate-700">No pharmacy medications added yet</div>
              <small>Click "+ Add Medicine" above to prescribe drugs from hospital inventory.</small>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {rxForm.medicines.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-3 position-relative"
                >
                  <div className="row g-2 align-items-center">
                    {/* Medicine Dropdown */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">
                        Medicine #{idx + 1}
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={item.medicine}
                        onChange={(e) => updateMedicine(idx, "medicine", e.target.value)}
                      >
                        <option value="">-- Choose Medicine (Optional) --</option>
                        {medicinesList.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name} ({med.strength || med.dosage_form || "Tab"}) — ₹{med.unit_price || med.price || "0"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dosage */}
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. 500mg"
                        value={item.dosage}
                        onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
                      />
                    </div>

                    {/* Frequency */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Frequency</label>
                      <select
                        className="form-select form-select-sm"
                        value={item.frequency}
                        onChange={(e) => updateMedicine(idx, "frequency", e.target.value)}
                      >
                        {FREQUENCY_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration */}
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Duration</label>
                      <select
                        className="form-select form-select-sm"
                        value={item.duration}
                        onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                      >
                        {DURATION_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity & Delete */}
                    <div className="col-md-1 d-flex flex-column align-items-end">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Qty</label>
                      <div className="d-flex align-items-center gap-1 w-100">
                        <input
                          type="number"
                          min="1"
                          className="form-control form-control-sm text-center"
                          value={item.quantity}
                          onChange={(e) => updateMedicine(idx, "quantity", e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm p-1 rounded-2"
                          onClick={() => removeMedicine(idx)}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: EXTERNAL / SPECIAL MEDS */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 bg-purple-subtle text-purple rounded-3">
                <Sparkles size={18} />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-slate-900">External / Custom Medications</h6>
                <small className="text-muted">Specialty drugs or brands for outside purchase</small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={addExternalMedicine}
            >
              <Plus size={14} /> Add External Med
            </button>
          </div>

          {rxForm.external_medicines.length === 0 ? (
            <div className="p-3 bg-slate-50 rounded-3 text-center text-muted border border-slate-100 small">
              No external specialty medications specified.
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {rxForm.external_medicines.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-3">
                  <div className="row g-2 align-items-center">
                    <div className="col-md-5">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Drug / Brand Name (e.g. Augmentin 625 DUO)"
                        value={item.medicine_name}
                        onChange={(e) => updateExternalMedicine(idx, "medicine_name", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Instructions (e.g. 1 tab thrice daily after meals for 5 days)"
                        value={item.instructions}
                        onChange={(e) => updateExternalMedicine(idx, "instructions", e.target.value)}
                      />
                    </div>
                    <div className="col-md-1 text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 rounded-2"
                        onClick={() => removeExternalMedicine(idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: LABORATORY INVESTIGATION ORDERS */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 bg-amber-subtle text-warning-emphasis rounded-3">
                <FlaskConical size={18} />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-slate-900">Diagnostic Laboratory Test Orders</h6>
                <small className="text-muted">Auto-routes request to Hospital Pathology / Biochemistry Lab</small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={addLabTest}
            >
              <Plus size={14} /> Order Lab Test
            </button>
          </div>

          {rxForm.lab_tests.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-3 text-center text-muted border border-slate-100">
              <FlaskConical size={24} className="opacity-50 mb-1" />
              <div className="small fw-medium text-slate-700">No lab investigations ordered</div>
              <small>Click "+ Order Lab Test" above if diagnostics (CBC, Blood Sugar, X-Ray) are required.</small>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {rxForm.lab_tests.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-3">
                  <div className="row g-2 align-items-center">
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">
                        Select Diagnostic Test
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={item.test}
                        onChange={(e) => updateLabTest(idx, "test", e.target.value)}
                      >
                        <option value="">-- Choose Lab Test (Optional) --</option>
                        {labTestsList.map((test) => (
                          <option key={test.id} value={test.id}>
                            {test.name} ({test.category || "Diagnostic"}) — ₹{test.price || "0"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Clinical Instructions / Reason</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Fasting sample required, check inflammatory markers"
                        value={item.notes}
                        onChange={(e) => updateLabTest(idx, "notes", e.target.value)}
                      />
                    </div>
                    <div className="col-md-1 d-flex flex-column align-items-end justify-content-end">
                      <label className="form-label small fw-semibold text-transparent mb-1">Del</label>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 rounded-2"
                        onClick={() => removeLabTest(idx)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;
