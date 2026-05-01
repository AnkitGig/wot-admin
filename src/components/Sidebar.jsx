import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login', { replace: true });
        Swal.fire({
          icon: 'success',
          title: 'Logged out',
          text: 'You have been successfully logged out.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-inner">
        <div id="sidebar-menu" className="sidebar-menu">
          <ul className="sidebar-vertical list-unstyled">

            <li>
              <Link to="/dashboard" className={isActive("/dashboard")}>
                <i className="fas fa-tachometer-alt me-2"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link to="/user-list" className={isActive("/user-list")}>
                <i className="fas fa-users me-2"></i>
                <span>Users</span>
              </Link>
            </li>

            <li>
              <Link to="/plans" className={isActive("/plans")}>
                <i className="fas fa-credit-card me-2"></i>
                <span>Plans</span>
              </Link>
            </li>

            <li>
              <Link to="/tool-flags" className={isActive("/tool-flags")}>
                <i className="fas fa-tools me-2"></i>
                <span>Tool Flags</span>
              </Link>
            </li>

            <li>
              <Link to="/courses" className={isActive("/courses")}>
                <i className="fas fa-book me-2"></i>
                <span>Courses</span>
              </Link>
            </li>

            <li>
              <Link to="/admin-categories" className={isActive("/admin-categories")}>
                <i className="fas fa-tags me-2"></i>
                <span>Categories</span>
              </Link>
            </li>

            <li>
              <Link to="/quizes" className={isActive("/quizes")}>
                <i className="fas fa-file-alt me-2"></i>
                <span>Quizzes</span>
              </Link>
            </li>

            <li>
              <Link to="/glossaries" className={isActive("/glossaries")}>
                <i className="fas fa-book-open me-2"></i>
                <span>Glossaries</span>
              </Link>
            </li>

            <li>
              <Link to="/coupons" className={isActive("/coupons")}>
                <i className="fas fa-ticket-alt me-2"></i>
                <span>Coupons</span>
              </Link>
            </li>
            <li>
              <Link to="/packs" className={isActive("/packs")}>
                <i className="fas fa-box me-2"></i>
                <span>Recharge Packs</span>
              </Link>
            </li>
            <li>
              <Link to="/faq" className={isActive("/faq")}>
                <i className="fas fa-question-circle me-2"></i>
                <span>FAQ</span>
              </Link>
            </li>

            <li>
              <Link to="/news" className={isActive("/news")}>
                <i className="fas fa-newspaper me-2"></i>
                <span>News</span>
              </Link>
            </li>

            <li>
              <Link to="/notifications" className={isActive("/notifications")}>
                <i className="fas fa-bell me-2"></i>
                <span>Notifications</span>
              </Link>
            </li>

            <li>
              <Link to="/email-templates" className={isActive("/email-templates")}>
                <i className="fas fa-envelope me-2"></i>
                <span>Email Templates</span>
              </Link>
            </li>

            <li>
              <Link to="/Broker" className={isActive("/Broker")}>
                <i className="fas fa-handshake me-2"></i>
                <span>Broker</span>
              </Link>
            </li>

            {/* <li>
              <Link to="/coupon-categories" className={isActive("/coupon-categories")}>
                <i className="fas fa-layer-group me-2"></i>
                <span>Coupon Categories</span>
              </Link>
            </li> */}

            <li className="border-top mt-3 pt-3">
              <button
                onClick={handleLogout}
                className="btn btn-outline-danger w-100"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0.5rem 0.75rem' }}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                <span>Logout</span>
              </button>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
}
