import { Suspense, lazy } from "react";
import { Outlet, Route, Routes } from "react-router";
import LandingLayout from "./components/layout/LandingLayout";
import PageLayout from "./components/layout/PageLayout";
import MainLayout from './components/layout/MainLayout';
import './App.css';
import PrivateRoute from "./components/common/PrivateRoute";
import LinearProgress from "./components/common/LinearProgress";
import { useAuth } from "./contexts/authContext";
import LoginModal from "./components/Auth/LoginModal";

// Lazy-loaded pages
const LandingPage = lazy(() => import("./components/LandingPage/LandingPage"));
const WishlistPage = lazy(() => import("./components/layout/Pages/WishlistPage"));
const LoginPage = lazy(() => import("./components/Auth/LoginPage"));
const SignUpPage = lazy(() => import("./components/Auth/SignUpPage"));
const EditUserPage = lazy(() => import("./components/Auth/EditUserPage"));
const UserManagementPage = lazy(() => import("./components/UserManagementPage"));
const ResetPasswordPage = lazy(() => import("./components/Auth/ResetPasswordPage"));
const DevicePage = lazy(() => import("./components/DevicePage"));
const ARDetectionPage = lazy(() => import("./components/ARDetectionPage"));
const ModelTrainingPage = lazy(() => import("./components/ModelTraining"));
const HydroponicDevicePage = lazy(() =>
  import("./components/HydroponicSystemPage").then((m) => ({
    default: m.HydroponicDevicePage,
  }))
);

const HydroponicSystemPage = lazy(() =>
  import("./components/HydroponicSystemPage").then((m) => ({
    default: m.HydroponicSystemPage,
  }))
);

const PlantBatchPage = lazy(() =>
  import("./components/HydroponicSystemPage/HydroponicPlantPage")
);



const ProductDetailPage = lazy(() => import("./components/layout/Pages/ProductDetailPage"));
const RoleAssignmentForm = lazy(() => import("./components/RoleAssignment"));
const SchedulerPage = lazy(() => import("./components/SchedulerPage"));
const PaymentManagementPage = lazy(() => import("./components/Payments").then(m => ({ default: m.PaymentManagementPage })));
const JackpotPage = lazy(() => import("./components/Jackpot").then(m => ({ default: m.JackpotPage })));
const CreateDrawPage = lazy(() => import("./components/Jackpot").then(m => ({ default: m.CreateDrawPage })));
const MigrationPage = lazy(() => import("./components/Migration").then(m => ({ default: m.MigrationPage })));
const MigrationWizardPage = lazy(() => import("./components/Migration").then(m => ({ default: m.MigrationWizardPage })));
const ProductManagementPage = lazy(() => import("./components/Product").then(m => ({ default: m.ProductManagementPage })));
const CmsPostManagementPage = lazy(() => import("./components/CMS").then(m => ({ default: m.CmsPostManagementPage })));
const CmsPostEditPage = lazy(() => import("./components/CMS").then(m => ({ default: m.CmsPostEditPage })));
const CmsPostCreatePage = lazy(() => import("./components/CMS").then(m => ({ default: m.CmsPostCreatePage })));

function App() {
  const { showLoginModal, setShowLoginModal } = useAuth();
  return (
    <>
      <Suspense fallback={
        <LinearProgress
          position="absolute" // or 'fixed' if you want it on top of screen
          thickness="h-1"
          duration={3000} // adjust as needed
        />
      }>
        <Routes>
          {/* Public auth pages (LandingLayout) */}
          <Route element={<LandingLayout />}>
            <Route path="" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>


          {/* Public pages (PageLayout) */}
          <Route element={<PageLayout />}>
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
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
              path="/dashboard/products"
              element={
                <PrivateRoute>
                  <ProductManagementPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/cms"
              element={
                <PrivateRoute>
                  <CmsPostManagementPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/cms/new"
              element={
                <PrivateRoute>
                  <CmsPostCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/cms/:id/edit"
              element={
                <PrivateRoute>
                  <CmsPostEditPage />
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
            <Route
              path="/jackpot/create"
              element={
                <PrivateRoute>
                  <CreateDrawPage />
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

            <Route
              path="/batches"
              element={
                <PrivateRoute>
                  <PlantBatchPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/batches/new"
              element={
                <PrivateRoute>
                  <PlantBatchPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/batches/:id"
              element={
                <PrivateRoute>
                  <PlantBatchPage />
                </PrivateRoute>
              }
            />
            <Route path="/scheduler-health" element={<SchedulerPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Outlet />} />
        </Routes>
      </Suspense>

      {/* 🔥 GLOBAL LOGIN MODAL */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

export default App;
