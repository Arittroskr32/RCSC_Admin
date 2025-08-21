import React, { createContext, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import axios from "axios";

const backend_url = "https://rcsc-backend.onrender.com";

export const Context = createContext({
  isAuthorized: false,
  setIsAuthorized: () => {},
});

const AppWrapper = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [BACKEND_URL, setBACKEND_URL] = useState("https://rcsc-backend.onrender.com");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBACKEND_URL(backend_url);

    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/admin/getuser`, {
          withCredentials: true,
        });

        if (response.data.success && response.data.user) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <Context.Provider value={{ isAuthorized, setIsAuthorized, BACKEND_URL }}>
      <BrowserRouter>
            <App />
      </BrowserRouter>
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
