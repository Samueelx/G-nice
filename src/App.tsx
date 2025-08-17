import { useState } from "react";
import AppRoutes from "./routes/Routes";
import { useGlobalNotifications } from "@/hooks/useGlobalNotifications";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";

export default function App() {
  const [errorDismissed, setErrorDismissed] = useState(false);
  
  // This will start polling for notifications globally as soon as the app loads
  const { unreadCount, notifications, hasErrors } = useGlobalNotifications();
  
  // Optional: Log for debugging during development
  console.log('Global notifications state:', { 
    unreadCount, 
    notificationsCount: notifications.length, 
    hasErrors 
  });
  
  // Reset dismissed state when errors are resolved
  if (!hasErrors && errorDismissed) {
    setErrorDismissed(false);
  }

  return (
    <div>
      <AppRoutes />
      
      {/* Show a compact dismissible error alert for mobile */}
      {hasErrors && !errorDismissed && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-xs mx-auto">
          <Alert variant="destructive" className="relative bg-red-50 border-red-200 shadow-lg">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="pr-6 text-xs">
              Connection error. Retrying...
            </AlertDescription>
            <button
              onClick={() => setErrorDismissed(true)}
              className="absolute top-1.5 right-1.5 text-red-600 hover:text-red-800"
            >
              <X className="h-3 w-3" />
            </button>
          </Alert>
        </div>
      )}
    </div>
  );
}