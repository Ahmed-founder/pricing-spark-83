import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@cloudflare/kumo/styles";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
