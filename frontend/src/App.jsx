<<<<<<< HEAD
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Doctor from "./pages/Doctor";
import LabTechnician from "./pages/LabTechnician";

import PharmacyDashboard from "./pages/pharmacist/PharmacyDashboard";
import MedicineStock from "./pages/pharmacist/MedicineStock";
import PrescriptionList from "./pages/pharmacist/PrescriptionList";
import PrescriptionDetails from "./pages/pharmacist/PrescriptionDetails";
import DispenseMedicine from "./pages/pharmacist/DispenseMedicine";
import PharmacyBill from "./pages/pharmacist/PharmacyBill";
import SalesReports from "./pages/pharmacist/SalesReports";
import PharmacyBillPrint from "./pages/pharmacist/PharmacyBillPrint";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Default / Admin
        ========================== */}
        <Route path="/" element={<Admin />} />
        <Route path="/admin" element={<Admin />} />

        {/* =========================
            Doctor
        ========================== */}
        <Route path="/doctor" element={<Doctor />} />

        {/* =========================
            Lab Technician
        ========================== */}
        <Route
          path="/lab-technician"
          element={<LabTechnician />}
        />

        {/* =========================
            Login
        ========================== */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* =========================
            PHARMACIST
        ========================== */}

        {/* Pharmacist Dashboard */}
        <Route
          path="/pharmacist"
          element={<PharmacyDashboard />}
        />

        <Route
          path="/pharmacist/dashboard"
          element={<PharmacyDashboard />}
        />

        {/* Medicine Stock */}
        <Route
          path="/pharmacist/medicines"
          element={<MedicineStock />}
        />

        {/* Prescription Management */}
        <Route
          path="/pharmacist/prescriptions"
          element={<PrescriptionList />}
        />

        {/* Prescription Details */}
        <Route
          path="/pharmacist/prescriptions/:id"
          element={<PrescriptionDetails />}
        />

        {/* Dispense Medicine */}
        <Route
          path="/pharmacist/dispense/:id"
          element={<DispenseMedicine />}
        />

        {/* Pharmacy Bill */}
        <Route
          path="/pharmacist/bills/:id"
          element={<PharmacyBill />}
        />

        {/* Printable Pharmacy Bill */}
        <Route
          path="/pharmacist/bills/:id/print"
          element={<PharmacyBillPrint />}
        />

        {/* Sales Reports */}
        <Route
          path="/pharmacist/reports"
          element={<SalesReports />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
=======
import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
>>>>>>> 542af1449569d94938888abbe2cb0526e80c41ba
