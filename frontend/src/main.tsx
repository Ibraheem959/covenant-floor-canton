import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Floor } from "./Floor";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Floor />
  </StrictMode>,
);
