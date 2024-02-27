import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Topbar from "./pages/global/Topbar";
import Sidebar from "./pages/global/Sidebar";
import Dashboard from "./pages/dashboard";
import FAQ from "./pages/faq";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Devices from "./pages/devices";
import Login from "./pages/login";
import Register from "./pages/register";
import PrivateRoutes from "./components/PrivateRoutes";
import { Provider } from 'react-redux';
import store from './redux/store'


function LoginPage({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return isLoggedIn ? (
    children
  ) : (
    <div>
      <Login></Login>
      <button onClick={() => setIsLoggedIn(true)}>Log in</button>
    </div>
  );
}

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <div className="app">
            <Sidebar isSidebar={isSidebar} />
            <main className="content">
              <Topbar setIsSidebar={setIsSidebar} />
              <Routes>
                <Route element={<PrivateRoutes />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/faq" element={<FAQ />} />
                </Route>
                <Route element={<Login/>} path="/login"/>
                <Route element={<Register/>} path="/register"/>
              </Routes>
            </main>
          </div>
          </Provider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
