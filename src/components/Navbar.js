import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

function Navbar({ user, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success bg-gradient shadow mb-4" style={{ background: 'linear-gradient(90deg, #28a745, #dc3545)' }}>
      <div className="container-fluid">
        {/* Creative Branding with Tagline */}
        <Link className="navbar-brand d-flex align-items-center" to="/booking">
          <span className="fs-3 fw-bold">🚖 Kenya Taxi</span>
          <small className="ms-2 text-light d-none d-md-block">Ride with Pride</small>
        </Link>
        
        {/* Toggler for Mobile */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Book a Ride Link */}
            <li className="nav-item">
              <Link
                className="nav-link text-white fw-semibold px-3 py-2 rounded-3 mx-1 transition-all hover-bg-light hover-text-dark"
                to="/booking"
                style={{ transition: 'background-color 0.3s, color 0.3s' }}
              >
                <i className="bi bi-car-front-fill me-1"></i>Book a Ride
              </Link>
            </li>

            {/* Login/Logout with Badge */}
            {user ? (
              <li className="nav-item d-flex align-items-center">
                <button
                  className="nav-link btn btn-link text-danger fw-semibold px-3 py-2 rounded-3 mx-1 transition-all hover-bg-danger hover-text-white"
                  onClick={handleLogout}
                  style={{ transition: 'background-color 0.3s, color 0.3s' }}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>Logout
                </button>
                <span className="badge bg-light text-success rounded-pill ms-1">Logged In</span>
              </li>
            ) : (
              <li className="nav-item d-flex align-items-center">
                <Link
                  className="nav-link text-danger fw-semibold px-3 py-2 rounded-3 mx-1 transition-all hover-bg-danger hover-text-white"
                  to="/auth"
                  style={{ transition: 'background-color 0.3s, color 0.3s' }}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>Login
                </Link>
                <span className="badge bg-light text-danger rounded-pill ms-1">Guest</span>
              </li>
            )}

            {/* Dark Mode Toggle */}
            <li className="nav-item">
              <button
                className="nav-link btn btn-outline-light btn-sm rounded-circle p-2 mx-1 transition-transform"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                style={{ transition: 'transform 0.3s', transform: darkMode ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;