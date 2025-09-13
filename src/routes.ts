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

  // Main app layout
  layout("components/layout/MainLayout.tsx", [
    index("devices-controller/pages/DeviceControllerPage.tsx"),
    route("ar-detection", "components/ARDetectionPage/ARDetectionPage.tsx"),
    route("model-training", "components/ModelTraining/ModelTrainingPage.tsx"),
    route("hydroponic-system", "components/HydroponicSystemPage/HydroponicSystemPage.tsx"),
  ]),

] satisfies RouteConfig;



