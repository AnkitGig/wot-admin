import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    document.body.classList.toggle("mini-sidebar");
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("active");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      className="header header-one d-flex align-items-center justify-content-between px-3"
     style={{
        background: "#ffffff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        position: "fixed",
        top: 0,
        left: "0px",  
        right: "0px",         // same as sidebar width
        // width: "calc(100% - 260px)",
        zIndex: 1000,
        height: "60px",
        transition: "all 0.3s ease"
      }}
    >
      {/* ===== LEFT SECTION ===== */}
      <div className="d-flex align-items-center">

        {/* Mobile Logo */}
        <div className="d-lg-none">
          <Link to="/dashboard">
            <img
              src="/assets/img/logo.png"
              alt="Logo"
              className="img-fluid"
              style={{ width: "auto", height: "20px" }}
            />
          </Link>
        </div>

        {/* Desktop Logo */}
        <div className="d-none d-lg-block">
          <Link to="/dashboard">
            <img
              src="/assets/img/logo.png"
              alt="Logo"
              className="img-fluid"
              style={{
                width: "auto",
                padding: "6px",
                margin:"0px 40px",
                height: "60px",
                backgroundColor: "#fff"
              }}
            />
          </Link>
        </div>

        {/* Sidebar Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="btn btn-link ms-3"
          style={{ textDecoration: "none" }}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* ===== SEARCH ===== */}
      {/* <div className="top-nav-search d-none d-md-block">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            className="form-control"
            placeholder="Search dashboard"
          />
        </form>
      </div> */}

      {/* ===== RIGHT SECTION ===== */}
      <ul className="nav user-menu align-items-center">

        {/* Mobile Hamburger */}
        {/* <li className="nav-item d-lg-none">
          <button
            className="btn btn-link"
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <i className="fas fa-bars"></i>
          </button>
        </li> */}

        {/* User Dropdown */}
        <li className="nav-item dropdown">
          <button
            className="user-link nav-link dropdown-toggle btn btn-link"
            data-bs-toggle="dropdown"
            style={{ textDecoration: "none" }}
          >
            <img
              src="/assets/img/profiles/avatar-07.jpg"
              alt="User"
              style={{
                width: "35px",
                borderRadius: "50%"
              }}
            />
            <span className="ms-2 d-none d-md-inline-block">
              <span className="fw-semibold">Admin</span>
              <span className="d-block small text-muted">John Smith</span>
            </span>
          </button>

          <div className="dropdown-menu dropdown-menu-end">
            <button 
              className="dropdown-item" 
              onClick={handleLogout}
              style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
            >
              Log Out
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
}
