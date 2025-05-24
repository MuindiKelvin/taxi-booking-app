import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false once auth state is determined
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.className = darkMode ? 'bg-dark' : 'bg-light';
  }, [darkMode]);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Checking authentication...</p>
          </div>
        </div>
      );
    }
    
    return user ? children : <Navigate to="/auth" replace />;
  };

  // Public Route Component (redirect to booking if already authenticated)
  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading application...</p>
          </div>
        </div>
      );
    }
    
    return user ? <Navigate to="/booking" replace /> : children;
  };

  return (
    <Router>
      <div className={`container-fluid ${darkMode ? 'dark-mode' : ''}`}>
        {/* Only show Navbar when user is authenticated and not loading */}
        {!loading && user && (
          <Navbar user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
        
        <Routes>
          {/* Default route - redirect based on auth status */}
          <Route 
            path="/" 
            element={
              loading ? (
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Initializing application...</p>
                  </div>
                </div>
              ) : user ? (
                <Navigate to="/booking" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          
          {/* Protected booking route */}
          <Route 
            path="/booking" 
            element={
              <ProtectedRoute>
                <BookingForm user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Public auth route */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <Auth setUser={setUser} />
              </PublicRoute>
            } 
          />
          
          {/* Dashboard route (if you want to add one) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="container mt-5">
                  <div className="row justify-content-center">
                    <div className="col-12 col-md-8">
                      <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-primary text-white text-center py-4">
                          <h2 className="mb-0">
                            <i className="fas fa-tachometer-alt me-2"></i>
                            Dashboard
                          </h2>
                        </div>
                        <div className="card-body p-5 text-center">
                          <div className="mb-4">
                            <i className="fas fa-user-circle text-primary" style={{fontSize: '4rem'}}></i>
                          </div>
                          <h3 className="mb-3">Welcome, {user?.displayName || user?.email}!</h3>
                          <p className="text-muted mb-4">
                            This is your dashboard. You can manage your bookings and account settings here.
                          </p>
                          <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                            <a href="/booking" className="btn btn-primary btn-lg me-md-2">
                              <i className="fas fa-calendar-plus me-2"></i>
                              Make New Booking
                            </a>
                            <button className="btn btn-outline-secondary btn-lg">
                              <i className="fas fa-cog me-2"></i>
                              Settings
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Profile route */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <div className="container mt-5">
                  <div className="row justify-content-center">
                    <div className="col-12 col-md-8">
                      <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-success text-white text-center py-4">
                          <h2 className="mb-0">
                            <i className="fas fa-user me-2"></i>
                            User Profile
                          </h2>
                        </div>
                        <div className="card-body p-5">
                          <div className="row">
                            <div className="col-md-4 text-center mb-4">
                              <div className="mb-3">
                                {user?.photoURL ? (
                                  <img 
                                    src={user.photoURL} 
                                    alt="Profile" 
                                    className="rounded-circle"
                                    style={{width: '120px', height: '120px', objectFit: 'cover'}}
                                  />
                                ) : (
                                  <i className="fas fa-user-circle text-muted" style={{fontSize: '7rem'}}></i>
                                )}
                              </div>
                              <h4 className="mb-2">{user?.displayName || 'User'}</h4>
                              <p className="text-muted">{user?.email}</p>
                            </div>
                            <div className="col-md-8">
                              <h5 className="mb-3">Account Information</h5>
                              <div className="table-responsive">
                                <table className="table table-borderless">
                                  <tbody>
                                    <tr>
                                      <td className="fw-semibold">Email:</td>
                                      <td>{user?.email}</td>
                                    </tr>
                                    <tr>
                                      <td className="fw-semibold">Display Name:</td>
                                      <td>{user?.displayName || 'Not set'}</td>
                                    </tr>
                                    <tr>
                                      <td className="fw-semibold">Email Verified:</td>
                                      <td>
                                        {user?.emailVerified ? (
                                          <span className="badge bg-success">
                                            <i className="fas fa-check me-1"></i>Verified
                                          </span>
                                        ) : (
                                          <span className="badge bg-warning">
                                            <i className="fas fa-exclamation-triangle me-1"></i>Not Verified
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="fw-semibold">Account Created:</td>
                                      <td>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</td>
                                    </tr>
                                    <tr>
                                      <td className="fw-semibold">Last Sign In:</td>
                                      <td>{user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route - 404 page */}
          <Route 
            path="*" 
            element={
              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-12 col-md-6 text-center">
                    <div className="card shadow-lg border-0 rounded-4">
                      <div className="card-body p-5">
                        <div className="mb-4">
                          <i className="fas fa-exclamation-triangle text-warning" style={{fontSize: '4rem'}}></i>
                        </div>
                        <h1 className="display-4 fw-bold text-primary mb-3">404</h1>
                        <h3 className="mb-3">Page Not Found</h3>
                        <p className="text-muted mb-4">
                          The page you're looking for doesn't exist or has been moved.
                        </p>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                          <a href="/" className="btn btn-primary btn-lg me-md-2">
                            <i className="fas fa-home me-2"></i>
                            Go Home
                          </a>
                          <button 
                            className="btn btn-outline-secondary btn-lg"
                            onClick={() => window.history.back()}
                          >
                            <i className="fas fa-arrow-left me-2"></i>
                            Go Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;