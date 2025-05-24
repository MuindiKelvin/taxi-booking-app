import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

function Auth({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);

  const authInstance = getAuth();

  useEffect(() => {
    setAnimateForm(true);
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(authInstance, email, password);
      } else {
        await signInWithEmailAndPassword(authInstance, email, password);
      }
      setEmail('');
      setPassword('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(authInstance, provider);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        animation: 'gradientShift 8s ease infinite'
      }}
    >
      {/* Animated Background Elements */}
      <div className="position-absolute w-100 h-100">
        <div 
          className="position-absolute rounded-circle opacity-25"
          style={{
            width: '300px',
            height: '300px',
            background: 'rgba(255,255,255,0.1)',
            top: '-100px',
            right: '-100px',
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="position-absolute rounded-circle opacity-25"
          style={{
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            bottom: '-50px',
            left: '-50px',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        ></div>
        <div 
          className="position-absolute rounded-circle opacity-25"
          style={{
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.1)',
            top: '20%',
            left: '10%',
            animation: 'float 10s ease-in-out infinite'
          }}
        ></div>
      </div>

      {/* Main Auth Container */}
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
            <div 
              className={`card border-0 shadow-lg position-relative overflow-hidden ${animateForm ? 'animate__animated animate__fadeInUp' : ''}`}
              style={{
                borderRadius: '25px',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.95)',
                transform: animateForm ? 'translateY(0)' : 'translateY(50px)',
                transition: 'all 0.6s ease'
              }}
            >
              {/* Glowing Top Border */}
              <div 
                className="position-absolute w-100"
                style={{
                  height: '4px',
                  top: '0',
                  background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                  animation: 'shimmer 3s linear infinite'
                }}
              ></div>

              {/* Header Section */}
              <div className="card-header bg-transparent border-0 text-center py-5">
                <div className="mb-4 position-relative">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle shadow-lg position-relative"
                    style={{
                      width: '100px',
                      height: '100px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    <i 
                      className={`fas ${isRegister ? 'fa-user-plus' : 'fa-sign-in-alt'} text-white transition-all`}
                      style={{
                        fontSize: '2.5rem',
                        transition: 'all 0.3s ease',
                        transform: animateForm ? 'scale(1)' : 'scale(0.8)'
                      }}
                    ></i>
                    
                    {/* Rotating Ring */}
                    <div 
                      className="position-absolute border border-white border-3 rounded-circle opacity-50"
                      style={{
                        width: '120px',
                        height: '120px',
                        animation: 'rotate 20s linear infinite'
                      }}
                    ></div>
                  </div>
                </div>

                <h1 
                  className="fw-bold mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '2.2rem'
                  }}
                >
                  {isRegister ? 'Join Our Community' : 'Welcome Back'}
                </h1>
                <p className="text-muted mb-0 fs-6">
                  {isRegister ? 'Create your account and start your journey' : 'Sign in to continue your experience'}
                </p>
              </div>

              {/* Form Section */}
              <div className="card-body px-5 pb-4">
                <form onSubmit={handleEmailAuth}>
                  {/* Email Input */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark mb-2">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email Address
                    </label>
                    <div className="position-relative">
                      <input
                        type="email"
                        className="form-control form-control-lg border-0 shadow-sm"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{
                          borderRadius: '15px',
                          paddingLeft: '50px',
                          background: 'rgba(102, 126, 234, 0.05)',
                          border: '2px solid transparent',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                      />
                      <i 
                        className="fas fa-at position-absolute text-muted"
                        style={{
                          left: '18px',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      ></i>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark mb-2">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg border-0 shadow-sm"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{
                          borderRadius: '15px',
                          paddingLeft: '50px',
                          paddingRight: '50px',
                          background: 'rgba(102, 126, 234, 0.05)',
                          border: '2px solid transparent',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                      />
                      <i 
                        className="fas fa-key position-absolute text-muted"
                        style={{
                          left: '18px',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      ></i>
                      <button
                        type="button"
                        className="btn btn-link position-absolute p-0 border-0"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        style={{
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6c757d'
                        }}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div 
                      className="alert alert-danger border-0 shadow-sm mb-4"
                      style={{
                        borderRadius: '15px',
                        background: 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        animation: 'shake 0.5s ease-in-out'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <small>{error}</small>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-lg w-100 fw-bold mb-4 border-0 shadow-lg position-relative overflow-hidden"
                    disabled={isLoading}
                    style={{
                      borderRadius: '15px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '15px',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                      transform: isLoading ? 'scale(0.98)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isRegister ? 'fa-rocket' : 'fa-sign-in-alt'} me-2`}></i>
                        {isRegister ? 'Create Account' : 'Sign In'}
                      </>
                    )}
                    
                    {/* Button Shine Effect */}
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                        animation: 'buttonShine 3s infinite'
                      }}
                    ></div>
                  </button>
                </form>

                {/* Divider */}
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center">
                    <hr className="flex-grow-1 border-0" style={{height: '1px', background: '#e9ecef'}} />
                    <span 
                      className="px-4 fw-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '0.9rem'
                      }}
                    >
                      OR CONTINUE WITH
                    </span>
                    <hr className="flex-grow-1 border-0" style={{height: '1px', background: '#e9ecef'}} />
                  </div>
                </div>

                {/* Google Auth Button */}
                <button 
                  className="btn btn-lg w-100 fw-semibold mb-4 border-0 shadow-sm d-flex align-items-center justify-content-center position-relative overflow-hidden"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  style={{
                    borderRadius: '15px',
                    background: 'white',
                    color: '#5f6368',
                    padding: '15px',
                    border: '2px solid #e8eaed',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                      e.target.style.borderColor = '#dadce0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                      e.target.style.borderColor = '#e8eaed';
                    }
                  }}
                >
                  <svg className="me-3" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Toggle Auth Mode */}
                <div className="text-center">
                  <div 
                    className="card border-0 shadow-sm position-relative overflow-hidden"
                    style={{
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 147, 251, 0.1))'
                    }}
                  >
                    <div className="card-body py-4">
                      <p className="mb-3 text-muted">
                        {isRegister ? 'Already part of our community?' : 'New to our platform?'}
                      </p>
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none fw-bold border-0 p-0 position-relative"
                        onClick={toggleAuthMode}
                        disabled={isLoading}
                        style={{
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '1.1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoading) {
                            e.target.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoading) {
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <i className={`fas ${isRegister ? 'fa-sign-in-alt' : 'fa-user-plus'} me-2`}></i>
                        {isRegister ? 'Sign In Instead' : 'Create Account'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div 
                className="card-footer bg-transparent border-0 text-center py-4"
                style={{background: 'rgba(102, 126, 234, 0.02)'}}
              >
                <div className="d-flex align-items-center justify-content-center text-muted">
                  <i className="fas fa-shield-alt me-2"></i>
                  <small>Your data is protected with enterprise-grade security</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        
        @keyframes buttonShine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default Auth;