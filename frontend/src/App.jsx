import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Topbar from "./pages/global/Topbar";
import Sidebar from "./pages/global/Sidebar";
import Dashboard from "./pages/dashboard";
import FAQ from "./pages/faq";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Devices from "./pages/devices";
import PrivateRoutes from "./components/PrivateRoutes";
import { Provider } from "react-redux";
import store from "./redux/store";
import Settings from "./pages/settings/Settings";
import { UserProvider } from "./providers/UserProvider";
import PageNotFound from "./pages/error/PageNotFound"
import Home from "./pages/home";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <UserProvider>
            <div className="app">
              {isLoggedIn && <Sidebar isSidebar={isSidebar} />}
              <main className="content">
                {isLoggedIn && (
                  <Topbar
                    setIsSidebar={setIsSidebar}
                    setIsLoggedIn={setIsLoggedIn}
                  />
                )}
                <Routes>
                  <Route
                    element={<PrivateRoutes setIsLoggedIn={setIsLoggedIn} />}
                  >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/devices" element={<Devices />} />
                    <Route path="/devices/:id" element={<Settings />} />
                    <Route path="/faq" element={<FAQ />} />
                  </Route>
                  <Route path="/" element={<Home setIsLoggedIn={setIsLoggedIn}/>} />
                  <Route path="*" element={<PageNotFound/>} />
                </Routes>
              </main>
            </div>
          </UserProvider>
        </Provider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
