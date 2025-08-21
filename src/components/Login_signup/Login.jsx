import { useState, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import { Context } from "../../main";

export default function Login() {
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    secretKey: "",
  });

  const { isAuthorized, setIsAuthorized, BACKEND_URL } = useContext(Context);
  const [redirect, setRedirect] = useState(false);

  // On mount, check if token cookie exists
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsAuthorized(true);
    }
  }, [setIsAuthorized]);

  // Handle form input
  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/login`, loginData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // let browser store httpOnly cookie
      });

      if (response.data.success) {
        setIsAuthorized(true);
        toast.success("Login Successful! Redirecting...");
        setTimeout(() => setRedirect(true), 1500);
      } else {
        // Shouldn't happen but safe fallback
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      // Clear any old token in case of failed login
      Cookies.remove("token");
      setIsAuthorized(false);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  if (isAuthorized || redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-form-heading">Admin Login</h2>
        <form onSubmit={handleLoginSubmit} className="auth-form-fields">
          <input
            type="text"
            name="username"
            placeholder="Admin Username"
            value={loginData.username}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            className="auth-form-input"
          />
          <input
            type="text"
            name="secretKey"
            placeholder="Secret Key"
            value={loginData.secretKey}
            onChange={handleChange}
            required
            className="auth-form-input"
          />
          <button type="submit" className="auth-form-button">Login</button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
