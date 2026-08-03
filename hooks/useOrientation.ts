
import { useState, useEffect, useCallback } from 'react';
import { OrientationData } from '../types';

export const useOrientation = () => {
  const [data, setData] = useState<OrientationData>({ beta: 0, gamma: 0, alpha: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setData({
      beta: event.beta || 0,
      gamma: event.gamma || 0,
      alpha: event.alpha || 0,
    });
  }, []);

  const requestPermission = async () => {
    // TypeScript check for experimental iOS API
    const DeviceOrientationRequest = (DeviceOrientationEvent as any).requestPermission;
    
    if (typeof DeviceOrientationRequest === 'function') {
      try {
        const response = await DeviceOrientationRequest();
        if (response === 'granted') {
          setIsPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setIsPermissionGranted(false);
          setError('Permission denied');
        }
      } catch (err) {
        setError('Orientation sensors not supported or blocked.');
        setIsPermissionGranted(false);
      }
    } else {
      // Browsers that don't require explicit permission
      setIsPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  return { data, error, isPermissionGranted, requestPermission };
};
