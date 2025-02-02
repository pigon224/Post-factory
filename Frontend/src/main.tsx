import ReactDOM from "react-dom/client"; // Import from 'react-dom/client' for React 18
import App from "./App";
import { UserContextProvider } from "./context/UserContext"; // Import your UserProvider

const root = ReactDOM.createRoot(document.getElementById("root")!); // Create root using createRoot
root.render(
  <UserContextProvider>
    <App />
  </UserContextProvider>
);
