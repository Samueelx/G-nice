import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { WebSocketProvider } from "./context/WebSocketProvider.tsx";
import { store } from "./store/store.ts";
import App from "./App.tsx";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID || '';


if (!GOOGLE_CLIENT_ID) {
  console.error("Google Client ID is not defined in the environment variables.");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <WebSocketProvider url="ws://localhost:8080/memefest-snapshot-01/feeds"
        enablePresence={true}>
        <App />
        </WebSocketProvider>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
