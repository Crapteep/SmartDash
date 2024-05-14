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
import Datastream from "./pages/datastream";
import Login from "./pages/login";
import Register from "./pages/register";
import PrivateRoutes from "./components/PrivateRoutes";
import { Provider } from "react-redux";
import store from "./redux/store";
import Settings from "./pages/settings/Settings";
import { UserProvider } from "./providers/UserProvider";
import Test from "./pages/test";


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
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/devices" element={<Devices />} />
                    <Route path="/devices/:id" element={<Settings />} />
                    <Route path="/faq" element={<FAQ />} />
                    {/* <Route path="/test" element={<Test />} /> */}
                  </Route>
                  <Route
                    path="/login"
                    element={<Login setIsLoggedIn={setIsLoggedIn} />}
                  />
                  <Route path="/register" element={<Register />} />
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
