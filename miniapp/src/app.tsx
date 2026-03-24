// ZaUI stylesheet
import "zmp-ui/zaui.css";
// Tailwind stylesheet
import "@/css/tailwind.css";
// Your stylesheet
import "@/css/app.css";

// React core
import { createRoot } from "react-dom/client";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mount the app
import Layout from "@/components/layout";

// Expose app configuration
import appConfig from "../app-config.json";

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

const queryClient = new QueryClient();

const root = createRoot(document.getElementById("app")!);
root.render(
  <QueryClientProvider client={queryClient}>
    <Layout />
  </QueryClientProvider>
);
