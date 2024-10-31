import React from "react";
import App from "./App";
import ReactDOM from "react-dom/client";
import { UserProvider } from "./components/Connexion/UserProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
