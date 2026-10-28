import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useHmis } from "../store/HmisStore";
import { ROLE_HOME } from "../utils/constants";
import { PAGES } from "./navConfig";

import Login from "../modules/auth/Login";
import RegisterUser from "../modules/auth/RegisterUser";
import NewPatientForm from "../modules/registration/NewPatientForm";
import PatientList from "../modules/registration/PatientList";
import PatientHistory from "../modules/doctors/PatientHistory";
import DispenseMedicine from "../modules/pharmacy/DispenseMedicine";
import MedicineInventory from "../modules/pharmacy/MedicineInventory";
import Dashboard from "../modules/admin/Dashboard";

function RequireAuth({ children }) {
  const { currentUser } = useHmis();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

// Redirects to the user's home page when their role can't open this page.
function RoleGate({ page, children }) {
  const { currentUser } = useHmis();
  if (!PAGES[page].roles.includes(currentUser.role)) {
    return <Navigate to={ROLE_HOME[currentUser.role]} replace />;
  }
  return children;
}

function HomeRedirect() {
  const { currentUser } = useHmis();
  return <Navigate to={currentUser ? ROLE_HOME[currentUser.role] : "/login"} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<RoleGate page="dashboard"><Dashboard /></RoleGate>} />
          <Route path="/registration" element={<RoleGate page="registration"><NewPatientForm /></RoleGate>} />
          <Route path="/patients" element={<RoleGate page="patients"><PatientList /></RoleGate>} />
          <Route path="/patient-history" element={<RoleGate page="history"><PatientHistory /></RoleGate>} />
          <Route path="/patient-history/:visitId" element={<RoleGate page="history"><PatientHistory /></RoleGate>} />
          <Route path="/dispensary" element={<RoleGate page="dispensary"><DispenseMedicine /></RoleGate>} />
          <Route path="/dispensary/:visitId" element={<RoleGate page="dispensary"><DispenseMedicine /></RoleGate>} />
          <Route path="/medicines" element={<RoleGate page="medicines"><MedicineInventory /></RoleGate>} />
          <Route path="/users" element={<RoleGate page="users"><RegisterUser /></RoleGate>} />
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
