import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import Map from './Map';
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function BookingForm({ user }) {
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [pickupInput, setPickupInput] = useState('');
  const [dropoffInput, setDropoffInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isPickupFocused, setIsPickupFocused] = useState(true);
  const [rides, setRides] = useState([]);
  const [error, setError] = useState('');
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [loadingRides, setLoadingRides] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);

  const db = getFirestore();

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateFare = (distance, duration = 10) => {
    const baseFare = 50;
    const perKmFare = 15;
    const perMinuteFare = 3;
    const minimumFare = 200;
    const fare = baseFare + distance * perKmFare + duration * perMinuteFare;
    return Math.max(fare, minimumFare).toFixed(2);
  };

  useEffect(() => {
    if (pickup && dropoff) {
      const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
      const fare = calculateFare(distance);
      setEstimatedFare({ distance: distance.toFixed(2), fare });
    } else {
      setEstimatedFare(null);
    }
  }, [pickup, dropoff]);

  const searchLocations = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=ke`,
        { headers: { 'User-Agent': 'taxi-booking-app' } }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchRides = useCallback(async () => {
    if (!user?.uid) {
      setRides([]);
      setLoadingRides(false);
      return;
    }

    setLoadingRides(true);
    setError('');
    
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const userRides = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      setRides(userRides);
      
      if (userRides.length === 0) {
        setError('No rides found. Book your first ride!');
      }
    } catch (err) {
      console.error('Fetch rides error:', err);
      try {
        const fallbackQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackRides = fallbackSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setRides(fallbackRides);
        
        if (fallbackRides.length === 0) {
          setError('No rides found. Book your first ride!');
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch error:', fallbackErr);
        setError('Unable to load your rides. Please check your connection and try again.');
      }
    } finally {
      setLoadingRides(false);
    }
    }, [user?.uid, db]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleSearchSelect = (result) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    };
    
    if (isPickupFocused) {
      setPickup(location);
      setPickupInput(result.display_name);
    } else {
      setDropoff(location);
      setDropoffInput(result.display_name);
    }
    
    setSearchQuery('');
    setSearchResults([]);
    setMapKey(prev => prev + 1);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('Please log in to book a ride.');
      return;
    }
    
    if (!pickup || !dropoff || !paymentMode) {
      setMessage('Please select pickup, dropoff, and payment mode.');
      return;
    }

    setIsBooking(true);
    try {
      const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
      const fare = calculateFare(distance);
      
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userEmail: user.email || '',
        pickup: { lat: pickup.lat, lng: pickup.lng, address: pickup.address },
        dropoff: { lat: dropoff.lat, lng: dropoff.lng, address: dropoff.address },
        paymentMode,
        distance: parseFloat(distance.toFixed(2)),
        fare: parseFloat(fare),
        status: 'pending',
        timestamp: serverTimestamp()
      });
      
      setMessage('Booking successful!');
      setShowModal(true);
      
      setPickup(null);
      setDropoff(null);
      setPickupInput('');
      setDropoffInput('');
      setPaymentMode('Cash');
      setEstimatedFare(null);
      setMapKey(prev => prev + 1);
      
      setTimeout(fetchRides, 1000);
      
    } catch (err) {
      console.error('Booking error:', err);
      setMessage('Error: ' + err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const shareReceipt = () => {
    const bookingId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const receipt = `🚕 Taxi Booking Receipt
📍 Pickup Location: ${pickup?.address || 'Not specified'}
🎯 Dropoff Location: ${dropoff?.address || 'Not specified'}
📏 Distance: ${estimatedFare?.distance || '0'} km
💰 Fare: KSh ${estimatedFare?.fare || '0'}
💳 Payment Method: ${paymentMode}
📅 Date: ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
👤 Booked by: ${user?.email || 'Anonymous'}
🔖 Booking ID: ${bookingId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Taxi Booking Receipt',
        text: receipt
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(receipt).then(() => {
        alert('Receipt copied to clipboard!');
      }).catch(() => {
        alert('Sharing not supported. Copy this receipt:\n\n' + receipt);
      });
    }
  };

  const progress = pickup && dropoff ? 100 : pickup ? 50 : 0;

  return (
    <div className="min-vh-100 d-flex" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
      <div className="container-fluid p-3">
        <div className="row g-3" style={{ minHeight: 'calc(100vh - 2rem)' }}>
          {/* Rides Section - Left Side */}
          <div className="col-lg-6 d-flex flex-column">
            <div className="card shadow-sm border-0 rounded-3 flex-grow-1" style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
              <div className="card-header py-3" style={{ background: 'linear-gradient(45deg, #6f42c1, #e83e8c)', color: 'white' }}>
                <h4 className="mb-0 fw-bold"><i className="fas fa-car me-2"></i>Your Rides</h4>
                <small className="opacity-90">View your booking history</small>
              </div>
              <div className="card-body p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                {loadingRides ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-2">Loading your rides...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <i className="fas fa-info-circle text-primary fs-3 mb-2"></i>
                    <p className="text-muted mb-2">{error}</p>
                    <button 
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      onClick={fetchRides}
                    >
                      <i className="fas fa-sync-alt me-1"></i>Retry
                    </button>
                  </div>
                ) : rides.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-car-side text-muted fs-3 mb-2"></i>
                    <p className="text-muted">No rides yet. Book your first ride!</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {rides.map((ride, index) => (
                      <div key={ride.id} className="list-group-item border-0 rounded-2 mb-2 hover-card p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-primary rounded-pill">Ride #{rides.length - index}</span>
                          <small className="text-muted">
                            {ride.timestamp instanceof Date 
                              ? ride.timestamp.toLocaleString('en-KE')
                              : new Date(ride.timestamp?.seconds * 1000 || Date.now()).toLocaleString('en-KE')}
                          </small>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted d-block">From:</small>
                          <p className="mb-1 text-truncate" title={ride.pickup?.address}>{ride.pickup?.address || 'N/A'}</p>
                          <small className="text-muted d-block">To:</small>
                          <p className="mb-1 text-truncate" title={ride.dropoff?.address}>{ride.dropoff?.address || 'N/A'}</p>
                        </div>
                        <div className="d-flex gap-2">
                          <span className="badge bg-light text-dark">{ride.distance?.toFixed(1) || '0.0'} km</span>
                          <span className="badge bg-light text-dark">KSh {ride.fare || '0'}</span>
                          <span className="badge bg-light text-dark">{ride.paymentMode || 'Cash'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form - Right Side */}
          <div className="col-lg-6 d-flex flex-column">
            <div className="card shadow-sm border-0 rounded-3 flex-grow-1" style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
              <div className="card-header py-3" style={{ background: 'linear-gradient(45deg, #28a745, #20c997)', color: 'white' }}>
                <h4 className="mb-0 fw-bold"><i className="fas fa-taxi me-2"></i>Book Your Taxi</h4>
                <small className="opacity-90">Quick & Easy Ride Booking</small>
              </div>
              <div className="card-body p-3">
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">Progress</small>
                    <small className="text-muted">{progress}%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%`, background: 'linear-gradient(45deg, #28a745, #20c997)' }}
                    ></div>
                  </div>
                </div>

                {/* Location Inputs */}
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold"><i className="fas fa-map-marker-alt me-1"></i>Pickup</label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    value={pickupInput}
                    onChange={(e) => {
                      setPickupInput(e.target.value);
                      setSearchQuery(e.target.value);
                      setIsPickupFocused(true);
                    }}
                    placeholder="Enter pickup location"
                    onFocus={() => setIsPickupFocused(true)}
                  />
                </div>
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold"><i className="fas fa-flag-checkered me-1"></i>Dropoff</label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    value={dropoffInput}
                    onChange={(e) => {
                      setDropoffInput(e.target.value);
                      setSearchQuery(e.target.value);
                      setIsPickupFocused(false);
                    }}
                    placeholder="Enter dropoff location"
                    onFocus={() => setIsPickupFocused(false)}
                  />
                  {searchResults.length > 0 && (
                    <div className="dropdown-menu show w-100 mt-1 shadow-sm rounded-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {searchLoading ? (
                        <div className="dropdown-item text-center">
                          <Spinner animation="border" size="sm" /> Searching...
                        </div>
                      ) : (
                        searchResults.map((result) => (
                          <button
                            key={result.place_id}
                            className="dropdown-item hover-bg-light"
                            onClick={() => handleSearchSelect(result)}
                          >
                            <i className="fas fa-map-pin me-2"></i>{result.display_name.split(',')[0]}
                            <small className="d-block text-muted">{result.display_name}</small>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Mode */}
                <div className="mb-3">
                  <label className="form-label fw-semibold"><i className="fas fa-wallet me-1"></i>Payment</label>
                  <select
                    className="form-control rounded-pill"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Card">Credit/Debit Card</option>
                  </select>
                </div>

                {/* Fare Estimate */}
                {estimatedFare && (
                  <div className="alert alert-success rounded-3 mb-3">
                    <i className="fas fa-calculator me-2"></i>
                    Fare: KSh {estimatedFare.fare} ({estimatedFare.distance} km)
                  </div>
                )}

                {/* Map */}
                <div className="mb-3 rounded-3 overflow-hidden" style={{ height: '250px' }}>
                  <Map
                    key={mapKey}
                    pickup={pickup}
                    dropoff={dropoff}
                    setPickup={(loc) => {
                      setPickup(loc);
                      setPickupInput(loc.address);
                      setMapKey(prev => prev + 1);
                    }}
                    setDropoff={(loc) => {
                      setDropoff(loc);
                      setDropoffInput(loc.address);
                      setMapKey(prev => prev + 1);
                    }}
                    searchLocation={pickup && isPickupFocused ? null : dropoff ? null : searchResults[0]}
                  />
                </div>

                {/* Booking Button */}
                <button
                  className="btn btn-success w-100 rounded-pill"
                  onClick={handleBooking}
                  disabled={!pickup || !dropoff || !paymentMode || isBooking}
                >
                  {isBooking ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Booking...
                    </>
                  ) : (
                    <>Book Now</>
                  )}
                </button>

                {/* Message */}
                {message && (
                  <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mt-3 rounded-3`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-3 border-0 shadow-sm">
                <div className="modal-header bg-success text-white border-0">
                  <h5 className="modal-title"><i className="fas fa-check-circle me-2"></i>Booking Confirmed</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p className="text-success fw-semibold">Ride booked successfully!</p>
                  <div className="bg-light p-3 rounded-3">
                    <p><strong>Pickup Location:</strong> {pickup?.address}</p>
                    <p><strong>Dropoff Location:</strong> {dropoff?.address}</p>
                    <p><strong>Distance:</strong> {estimatedFare?.distance} km</p>
                    <p><strong>Fare:</strong> KSh {estimatedFare?.fare}</p>
                    <p><strong>Payment:</strong> {paymentMode}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleString('en-KE')}</p>
                    <p><strong>Booking ID:</strong> {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>
                  <button className="btn btn-outline-primary w-100 mt-3 rounded-pill" onClick={shareReceipt}>
                    <i className="fas fa-share-alt me-2"></i>Share Receipt
                  </button>
                </div>
                <div className="modal-footer border-0">
                  <button className="btn btn-success w-100 rounded-pill" onClick={() => setShowModal(false)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .form-control, .btn {
          transition: all 0.2s ease;
        }
        .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
          border-color: #28a745;
        }
        .dropdown-menu {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .list-group-item {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}

export default BookingForm;