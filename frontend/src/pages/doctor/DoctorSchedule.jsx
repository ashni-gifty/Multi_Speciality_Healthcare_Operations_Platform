import React from "react";
import { Calendar, Clock, CheckCircle2, AlertCircle, Building, Stethoscope, ShieldCheck } from "lucide-react";

const DoctorSchedule = ({ availability = [], doctor }) => {
  const daysOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  const doctorAvailabilities = availability.filter((a) =>
    doctor ? Number(a.doctor) === Number(doctor.id) || a.doctor_id === doctor.id : true
  );

  const activeDaysCount = daysOrder.filter((d) => doctorAvailabilities.some((a) => a.day_of_week === d)).length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Metrics Banner */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Weekly OPD Days</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{activeDaysCount} Days / Wk</h4>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <Calendar size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Slot Interval</span>
                <h4 className="fw-bold mt-1 mb-0 text-purple">15 Mins / Pt</h4>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Consultation Room</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">OPD Cabin #4</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Building size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Duty Status</span>
                <h4 className="fw-bold mt-1 mb-0 text-success">On Duty</h4>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <ShieldCheck size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Schedule Grid Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <div>
              <h5 className="fw-bold mb-0 text-slate-900">Physician Weekly OPD Shift Schedule</h5>
              <p className="text-muted small mb-0">
                Scheduled consultation hours and patient appointment booking windows.
              </p>
            </div>
          </div>

          <div className="row g-3">
            {daysOrder.map((day) => {
              const shift = doctorAvailabilities.find((a) => a.day_of_week === day);

              return (
                <div key={day} className="col-md-6 col-lg-4">
                  <div
                    className={`p-3 rounded-3 border ${
                      shift
                        ? "bg-white border-primary border-opacity-50 shadow-xs"
                        : "bg-slate-50 border-slate-100 opacity-75"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-slate-900 mb-0">{day}</h6>
                      <span
                        className={`badge ${
                          shift ? "bg-emerald-subtle text-success" : "bg-slate-200 text-slate-600"
                        } px-2 py-1 small`}
                      >
                        {shift ? "Active Shift" : "Off Duty"}
                      </span>
                    </div>

                    {shift ? (
                      <div className="d-flex flex-column gap-1 small text-slate-700 mt-2">
                        <div className="d-flex align-items-center gap-1">
                          <Clock size={14} className="text-primary" />
                          <strong className="text-slate-900">
                            {shift.available_from ? shift.available_from.slice(0, 5) : "09:00"} -{" "}
                            {shift.available_to ? shift.available_to.slice(0, 5) : "17:00"}
                          </strong>
                        </div>
                        <div className="text-muted" style={{ fontSize: "11px" }}>
                          Slot Duration: <strong>{shift.slot_duration || 15} minutes per patient</strong>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted small mb-0 mt-2">No OPD consultations scheduled</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
