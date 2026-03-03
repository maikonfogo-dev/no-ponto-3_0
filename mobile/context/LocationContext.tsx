import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { useAuth } from './AuthContext';

interface LocationContextData {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  isWithinRadius: boolean;
  distance: number | null;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextData>({} as LocationContextData);

// Helper to calculate distance in meters (Haversine formula)
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371e3; // Radius of the earth in m
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in m
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  const refreshLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permissão de localização negada');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  useEffect(() => {
    refreshLocation();
    
    // Optional: Subscribe to location updates
    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      (newLocation) => {
        setLocation(newLocation);
      }
    );

    return () => {
      subscription.then((sub) => sub.remove());
    };
  }, []);

  useEffect(() => {
    if (location && user?.company) {
      const companyLat = user.company.latitude;
      const companyLon = user.company.longitude;
      const allowedRadius = user.company.allowedRadiusMeters;

      if (companyLat && companyLon) {
        const dist = getDistanceFromLatLonInM(
          location.coords.latitude,
          location.coords.longitude,
          companyLat,
          companyLon
        );
        setDistance(dist);
        setIsWithinRadius(dist <= allowedRadius);
      }
    }
  }, [location, user]);

  return (
    <LocationContext.Provider value={{ location, errorMsg, isWithinRadius, distance, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
