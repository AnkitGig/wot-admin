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
              <Link to="/courses" className={isActive("/courses")}>
                <i className="fas fa-book me-2"></i>
                <span>Courses</span>
              </Link>
            </li>

            <li>
              <Link to="/lessons" className={isActive("/lessons")}>
                <i className="fas fa-list me-2"></i>
                <span>Lessons</span>
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
              <Link to="/notifications" className={isActive("/notifications")}>
                <i className="fas fa-bell me-2"></i>
                <span>Notifications</span>
              </Link>
            </li>

            <li>
              <Link to="/settings" className={isActive("/settings")}>
                <i className="fas fa-cog me-2"></i>
                <span>Settings</span>
              </Link>
            </li>

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
