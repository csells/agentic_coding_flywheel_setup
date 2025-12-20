/**
 * User Preferences Storage
 *
 * Handles localStorage persistence of user choices during the wizard.
 * Uses useSyncExternalStore for React 19 compatible state management.
 */

import { useSyncExternalStore, useCallback, useRef, useEffect } from "react";

export type OperatingSystem = "mac" | "windows";

const OS_KEY = "acfs-user-os";

/**
 * Get the user's selected operating system from localStorage.
 */
export function getUserOS(): OperatingSystem | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(OS_KEY);
  if (stored === "mac" || stored === "windows") {
    return stored;
  }
  return null;
}

/**
 * Save the user's operating system selection to localStorage.
 */
export function setUserOS(os: OperatingSystem): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OS_KEY, os);
}

/**
 * Detect the user's OS from the browser's user agent.
 * Returns null if detection fails or on server-side.
 */
export function detectOS(): OperatingSystem | null {
  if (typeof window === "undefined") return null;

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return null;
}

// VPS IP Address storage
const VPS_IP_KEY = "acfs-vps-ip";

/**
 * Get the user's VPS IP address from localStorage.
 */
export function getVPSIP(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VPS_IP_KEY);
}

/**
 * Save the user's VPS IP address to localStorage.
 */
export function setVPSIP(ip: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VPS_IP_KEY, ip);
}

/**
 * Validate an IP address (basic IPv4 validation).
 */
export function isValidIP(ip: string): boolean {
  const pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!pattern.test(ip)) return false;

  const parts = ip.split(".");
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

// --- React Hooks using useSyncExternalStore ---

// Event emitter for localStorage changes within the same tab
const storageListeners = new Set<() => void>();

function emitStorageChange() {
  storageListeners.forEach((listener) => listener());
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {}; // No-op on server
  }
  storageListeners.add(callback);
  // Also listen for storage events from other tabs
  const handleStorage = () => callback();
  window.addEventListener("storage", handleStorage);
  return () => {
    storageListeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * Hook to get and set the user's operating system.
 * Uses useSyncExternalStore for React 19 compatibility.
 */
export function useUserOS(): [OperatingSystem | null, (os: OperatingSystem) => void] {
  const os = useSyncExternalStore(
    subscribeToStorage,
    getUserOS,
    () => null // Server snapshot
  );

  const setOS = useCallback((newOS: OperatingSystem) => {
    setUserOS(newOS);
    emitStorageChange();
  }, []);

  return [os, setOS];
}

/**
 * Hook to get and set the VPS IP address.
 * Uses useSyncExternalStore for React 19 compatibility.
 */
export function useVPSIP(): [string | null, (ip: string) => void] {
  const ip = useSyncExternalStore(
    subscribeToStorage,
    getVPSIP,
    () => null // Server snapshot
  );

  const setIP = useCallback((newIP: string) => {
    setVPSIP(newIP);
    emitStorageChange();
  }, []);

  return [ip, setIP];
}

/**
 * Hook to get the detected OS (from user agent).
 * Only runs on client side.
 */
export function useDetectedOS(): OperatingSystem | null {
  return useSyncExternalStore(
    () => () => {}, // No subscription needed for static detection
    detectOS,
    () => null // Server snapshot
  );
}

// --- Mounted state tracking ---

// Singleton for tracking mounted state across all useMounted calls
let isMountedGlobal = false;
const mountedListeners = new Set<() => void>();

function getMounted() {
  return isMountedGlobal;
}

function subscribeToMounted(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {}; // No-op on server
  }
  mountedListeners.add(callback);
  return () => mountedListeners.delete(callback);
}

/**
 * Hook to track if the component is mounted (client-side hydrated).
 * Uses useSyncExternalStore to avoid setState-in-effect lint errors.
 */
export function useMounted(): boolean {
  const hasSetMounted = useRef(false);

  // Set mounted state once on client
  useEffect(() => {
    if (!hasSetMounted.current) {
      hasSetMounted.current = true;
      isMountedGlobal = true;
      mountedListeners.forEach((listener) => listener());
    }
  }, []);

  return useSyncExternalStore(
    subscribeToMounted,
    getMounted,
    () => false // Server snapshot - never mounted on server
  );
}
