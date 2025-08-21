import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import useNavbarLogic from "./NavbarLogic";
import Cookies from "js-cookie"; 
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import "./Navbar.css";


const Navbar = () => {
  const { isOpen, toggleMenu } = useNavbarLogic();
  const navigate = useNavigate();
  const { isAuthorized, setIsAuthorized, BACKEND_URL } = useContext(Context);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthorized);

  // Sync isLoggedIn with isAuthorized
  useEffect(() => {
    setIsLoggedIn(isAuthorized);
  }, [isAuthorized]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${BACKEND_URL}/api/admin/logout`, {
        withCredentials: true,
      });

      Cookies.remove("token");
      setIsAuthorized(false);
      toast.success("Logged Out Successfully!", { autoClose: 2000 });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout failed. Please try again.");
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <img src="/Assets/RCSC_logo2.png" alt="RCSC Logo" className="nav-logo" />
          <h1 className="nav-title">RCSC Admin Panel</h1>
        </div>

        <ul className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about_us" className="nav-link">About</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
          <Link to="/member" className="nav-link">Member</Link>
          <Link to="/activities" className="nav-link">Activities</Link>
          <Link to="/contact" className="nav-link">Contacts</Link>
        </ul>

        <div className="nav-right">
          {isLoggedIn ? (
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="login-btn" onClick={handleLoginClick}>Login</button>
          )}
          <button onClick={toggleMenu} className="menu-btn">
            {isOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <ul className="mobile-menu">
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/about_us" className="mobile-link">About</Link>
          <Link to="/blog" className="mobile-link">Blog</Link>
          <Link to="/member" className="mobile-link">Member</Link>
          <Link to="/activities" className="mobile-link">Activities</Link>
          <Link to="/contact" className="mobile-link">Contacts</Link>

          {isLoggedIn ? (
            <button className="mobile-logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="mobile-login-btn" onClick={handleLoginClick}>Login</button>
          )}
        </ul>
      )}

      <ToastContainer />
    </nav>
  );
};

export default Navbar;
