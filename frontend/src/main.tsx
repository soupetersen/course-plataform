import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/query-client";
import { router } from "./routes";
import { ErrorProvider } from "./contexts/ErrorContext";
import { Toaster } from "./components/ui/toaster";
import "./styles/index.css";
import "./styles/responsive-text.css";
import "./styles/text-overflow-fix.css";
import "./styles/course-cards.css";
import "./styles/responsive-typography.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <RouterProvider router={router} />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ErrorProvider>
    </QueryClientProvider>
  </StrictMode>
);

