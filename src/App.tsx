import { useSelector } from "react-redux";
import { RootState } from "./store/store"; // Adjust path if needed
import { WebSocketProvider } from "./context/WebSocketProvider";
import AppRoutes from "./routes/Routes";

export default function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  console.log("Is authenticated? ", isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div>
        <AppRoutes />
      </div>
    );
  }

  return (
    <WebSocketProvider>
      <div>
        <AppRoutes />
      </div>
    </WebSocketProvider>
  );
}
