import { HmisProvider } from "./store/HmisStore";
import { ToastProvider } from "./components/ui";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <HmisProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </HmisProvider>
  );
}

export default App;
