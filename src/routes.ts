// routes.ts
import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Public layout (Landing pages, Auth, etc.)
  layout("components/layout/LandingLayout.tsx", [
    index("components/pages/LandingPage.tsx"),
  ]),

  // Main app layout for Admin
  layout("components/layout/MainLayout.tsx", [
    index("devices-controller/pages/DeviceControllerPage.tsx"),
    route("ar-detection", "components/ARDetectionPage/ARDetectionPage.tsx"),
    route("model-training", "components/ModelTraining/ModelTrainingPage.tsx"),
    route("hydroponic-system", "components/HydroponicSystemPage/HydroponicSystemPage.tsx"),
    route("payments", "components/Payments/PaymentManagementPage.tsx"),
    route("billiard", "components/billiard/TablesPage.tsx"),
    route("billiard/sessions/:sessionId", "components/billiard/SessionPage.tsx"),
    route("billiard/reports", "components/billiard/ReportsPage.tsx"),
    route("billiard/pricing-rules", "components/billiard/PricingRulesPage.tsx"),
    route("billiard/controllers", "components/billiard/ControllersPage.tsx"),
    route("billiard/shifts", "components/billiard/ShiftsPage.tsx"),
    route("billiard/bank-inbox", "components/billiard/BankInboxPage.tsx"),
    route("billiard/bank-account", "components/billiard/BankAccountPage.tsx"),
  ]),

] satisfies RouteConfig;



