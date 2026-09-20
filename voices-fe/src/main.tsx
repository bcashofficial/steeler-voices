import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { VoicesTheme } from "design_system/theme";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VoicesTheme>
      <App />
    </VoicesTheme>
  </StrictMode>,
);
