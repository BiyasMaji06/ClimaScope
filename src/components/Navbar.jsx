import { NavLink, useNavigate } from "react-router-dom";
import {
  clearSession,
  getSavedUser,
  isLoggedIn
} from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getSavedUser();
  const loggedIn = isLoggedIn();

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
    window.location.reload();
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <span className="brand-icon">☀</span>
        <span>
          Clima<span className="brand-light">Scope</span>
        </span>
      </NavLink>

      <nav className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/cities"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Manage Cities
        </NavLink>
      </nav>

      <div className="nav-user">
        {loggedIn ? (
          <>
            <div className="avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <span className="nav-username">
              {user?.name || "User"}
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link">
              Log In
            </NavLink>

            <NavLink to="/signup" className="nav-signup">
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}