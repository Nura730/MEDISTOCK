import { useState, useEffect, useRef, useCallback } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useSocket(socket, event, callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!socket) return;
    const handler = (...args) => callbackRef.current(...args);
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event]);
}

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    setStored(value);
    localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  return [stored, setValue];
}

// Haversine distance calculation
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Default user location — Kochi city center
export const DEFAULT_LOCATION = { lat: 9.9312, lng: 76.2673 };

export function getStockStatus(quantity, threshold) {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= threshold) return 'Low Stock';
  return 'In Stock';
}

export function getStatusColor(status) {
  switch (status) {
    case 'In Stock': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Low Stock': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Out of Stock': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getStatusDot(status) {
  switch (status) {
    case 'In Stock': return 'bg-emerald-500';
    case 'Low Stock': return 'bg-amber-500';
    case 'Out of Stock': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}

export function getApproxStock(quantity) {
  if (quantity === 0) return 'None';
  if (quantity <= 5) return '< 5 units';
  if (quantity <= 10) return '~10 units';
  if (quantity <= 25) return '~20+ units';
  if (quantity <= 50) return '~50+ units';
  return '50+ units';
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
