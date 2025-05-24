import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

function Map({ setPickup, setDropoff, searchLocation }) {
  const mapRef = useRef(null);
  const [pickupMarker, setPickupMarker] = useState(null);
  const [dropoffMarker, setDropoffMarker] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const pickupIcon = L.divIcon({
    className: 'custom-pickup-icon',
    html: `
      <div style="
        background: linear-gradient(135deg, #10b981, #059669);
        width: 28px; 
        height: 28px; 
        border-radius: 50%; 
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const dropoffIcon = L.divIcon({
    className: 'custom-dropoff-icon',
    html: `
      <div style="
        background: linear-gradient(135deg, #ef4444, #dc2626);
        width: 28px; 
        height: 28px; 
        border-radius: 50%; 
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const reverseGeocode = async (lat, lng) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&countrycodes=ke`,
        { headers: { 'User-Agent': 'taxi-booking-app' } }
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } finally {
      setIsLoading(false);
    }
  };

  const resetMarkers = () => {
    if (pickupMarker) {
      mapRef.current.removeLayer(pickupMarker);
      setPickupMarker(null);
      setPickupCoords(null);
      setPickup(null);
    }
    if (dropoffMarker) {
      mapRef.current.removeLayer(dropoffMarker);
      setDropoffMarker(null);
      setDropoffCoords(null);
      setDropoff(null);
    }
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const centerOnNairobi = () => {
    if (mapRef.current) {
      mapRef.current.setView([-1.286389, 36.817223], 12);
    }
  };

  useEffect(() => {
    const map = L.map('map', {
      center: [-1.286389, 36.817223], // Nairobi, Kenya
      zoom: 12,
      minZoom: 6,
      maxBounds: L.latLngBounds([-4.7, 33.9], [4.7, 41.9]), // Kenya bounds
      maxBoundsViscosity: 1.0,
      zoomControl: false, // We'll add custom controls
      scrollWheelZoom: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    mapRef.current = map;
    setMapReady(true);

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      if (lat >= -4.7 && lat <= 4.7 && lng >= 33.9 && lng <= 41.9) {
        const address = await reverseGeocode(lat, lng);
        if (!pickupMarker) {
          const marker = L.marker([lat, lng], { icon: pickupIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px;">
              <div style="color: #10b981; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
                Pickup Location
              </div>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">${address}</div>
            </div>
          `).openPopup();
          setPickupMarker(marker);
          setPickup({ lat, lng, address });
          setPickupCoords({ lat, lng });
        } else if (!dropoffMarker) {
          const marker = L.marker([lat, lng], { icon: dropoffIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px;">
              <div style="color: #ef4444; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; display: inline-block;"></span>
                Dropoff Location
              </div>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">${address}</div>
            </div>
          `).openPopup();
          setDropoffMarker(marker);
          setDropoff({ lat, lng, address });
          setDropoffCoords({ lat, lng });
        }
      }
    });

    return () => map.remove();
  }, [pickupMarker, dropoffMarker, setPickup, setDropoff]);

  useEffect(() => {
    if (searchLocation && mapRef.current) {
      const { lat, lng, address } = searchLocation;
      if (lat >= -4.7 && lat <= 4.7 && lng >= 33.9 && lng <= 41.9) {
        mapRef.current.setView([lat, lng], 15);
        if (!pickupMarker) {
          const marker = L.marker([lat, lng], { icon: pickupIcon }).addTo(mapRef.current);
          marker.bindPopup(`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px;">
              <div style="color: #10b981; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
                Pickup Location
              </div>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">${address}</div>
            </div>
          `).openPopup();
          setPickupMarker(marker);
          setPickup({ lat, lng, address });
          setPickupCoords({ lat, lng });
        } else if (!dropoffMarker) {
          const marker = L.marker([lat, lng], { icon: dropoffIcon }).addTo(mapRef.current);
          marker.bindPopup(`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px;">
              <div style="color: #ef4444; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; display: inline-block;"></span>
                Dropoff Location
              </div>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">${address}</div>
            </div>
          `).openPopup();
          setDropoffMarker(marker);
          setDropoff({ lat, lng, address });
          setDropoffCoords({ lat, lng });
        }
      }
    }
  }, [searchLocation, pickupMarker, dropoffMarker, setPickup, setDropoff]);

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white rounded-lg px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Loading location...</span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        id="map" 
        className="w-full h-96 rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        style={{ minHeight: '400px' }}
      ></div>

      {/* Custom Map Controls */}
      {mapReady && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
          <button
            onClick={zoomIn}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={zoomOut}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={centerOnNairobi}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
            title="Center on Nairobi"
          >
            <Navigation className="w-5 h-5 text-gray-600" />
          </button>
          {(pickupMarker || dropoffMarker) && (
            <button
              onClick={resetMarkers}
              className="bg-white hover:bg-red-50 border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl hover:border-red-200"
              title="Reset Markers"
            >
              <RotateCcw className="w-5 h-5 text-red-500" />
            </button>
          )}
        </div>
      )}

      {/* Enhanced Location Info Panel */}
      {(pickupCoords || dropoffCoords) && (
        <div className="absolute bottom-4 left-4 right-4 z-40">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Selected Locations</h3>
            </div>
            
            <div className="space-y-3">
              {pickupCoords && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-green-800 text-sm mb-1">Pickup Location</div>
                    <div className="text-xs text-green-600 font-mono">
                      {pickupCoords.lat.toFixed(6)}, {pickupCoords.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}
              
              {dropoffCoords && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-red-800 text-sm mb-1">Dropoff Location</div>
                    <div className="text-xs text-red-600 font-mono">
                      {dropoffCoords.lat.toFixed(6)}, {dropoffCoords.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {pickupCoords && dropoffCoords && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                  Both pickup and dropoff locations selected
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!pickupCoords && !dropoffCoords && (
        <div className="absolute top-4 left-4 z-40">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                Click on the map to set pickup location
              </span>
            </div>
          </div>
        </div>
      )}

      {pickupCoords && !dropoffCoords && (
        <div className="absolute top-4 left-4 z-40">
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-orange-800">
                Click on the map to set dropoff location
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;