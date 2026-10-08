import { Navigate, Route, Routes } from "react-router";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import EmployeeAttendance from "../pages/dashboard/EmployeeAttendance";
import LeaveRequests from "../pages/dashboard/LeaveRequests";
import SalesAttendance from "../pages/dashboard/SalesAttendance";
import SalesExpenses from "../pages/dashboard/SalesExpenses";
import SalesLocation from "../pages/dashboard/SalesLocation";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

const ComingSoon = ({ name }) => (
  <div className="rounded-lg bg-white p-6 text-gray-500 shadow">
    {name} page is coming soon.
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/employee-attendance"
            element={<EmployeeAttendance />}
          />
          <Route
            path="/leave-requests"
            element={<LeaveRequests />}
          />
          <Route
            path="/sales-attendance"
            element={<SalesAttendance />}
          />
          <Route path="/sales-expenses" element={<SalesExpenses />} />
          <Route
            path="/sales-location"
            element={<SalesLocation />}
          />
          <Route path="/settings" element={<ComingSoon name="Settings" />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
