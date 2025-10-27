import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionProvider } from "./contexts/SessionContext.tsx";

createRoot(document.getElementById("root")!).render(
  <SessionProvider>
    <App />
  </SessionProvider>
);