import { Outlet, Route, Routes } from "react-router";
import LandingLayout from "./components/layout/LandingLayout";
import MainLayout from './components/layout/MainLayout';
import './App.css';
import LandingPage from "./components/LandingPage/LandingPage";
import LoginPage from "./components/Auth/LoginPage";
import SignUpPage from "./components/Auth/SignUpPage";
import EditUserPage from "./components/Auth/EditUserPage";
import UserManagementPage from "./components/UserManagementPage";
import ResetPasswordPage from "./components/Auth/ResetPasswordPage";
import DevicePage from "./components/DevicePage";
import ARDetectionPage from "./components/ARDetectionPage";
import ModelTrainingPage from "./components/ModelTraining";
import HydroponicSystemPage from "./components/HydroponicSystemPage/HydroponicSystemPage";
import { HydroponicDevicePage } from "./components/HydroponicSystemPage";
import RoleAssignmentForm from "./components/RoleAssignment";
import SchedulerPage from "./components/SchedulerPage";
import { PaymentManagementPage } from "./components/Payments";
import { JackpotPage } from "./components/Jackpot";
import { MigrationPage, MigrationWizardPage } from "./components/Migration";
import PrivateRoute from "./components/common/PrivateRoute";

function App() {
  return (
    <Routes>
      {/* Public auth pages (LandingLayout) */}
      <Route element={<LandingLayout />}>
        <Route path="" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Dashboard / Admin routes (MainLayout) */}
      <Route element={<MainLayout />}>
        <Route
          path="/devices-controller"
          element={
            <PrivateRoute>
              <DevicePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <PrivateRoute>
              <EditUserPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/assignment-role"
          element={
            <PrivateRoute>
              <RoleAssignmentForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <PrivateRoute>
              <PaymentManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/jackpot"
          element={
            <PrivateRoute>
              <JackpotPage />
            </PrivateRoute>
          }
        />
        {/* Other dashboard features */}
        <Route path="/migrate" element={<MigrationPage />} />
        <Route path="/add-transform-data" element={<MigrationWizardPage />} />
        <Route path="/ar-detection" element={<ARDetectionPage />} />
        <Route path="/model-training" element={<ModelTrainingPage />} />
        <Route
          path="/hydroponic-system"
          element={
            <PrivateRoute>
              <HydroponicSystemPage />
            </PrivateRoute>
          }
        />
        <Route path="/hydro-devices" element={<HydroponicDevicePage />} />
        <Route path="/hydro-devices/new-device" element={<HydroponicDevicePage />} />
        <Route path="/hydro-devices/:id" element={<HydroponicDevicePage />} />
        <Route path="/scheduler-health" element={<SchedulerPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Outlet />} />
    </Routes>

  );
}

export default App;
