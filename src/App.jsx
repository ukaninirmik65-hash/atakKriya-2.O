import { BrowserRouter } from "react-router";
import { AuthProvider } from "./components/context/AuthProvider";
import ToastProvider from "./components/context/ToastProvider";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
