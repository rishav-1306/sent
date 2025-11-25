import { create } from "zustand";

export type AlertSeverity = "low" | "medium" | "high" | "info";

export interface Vulnerability {
  id: string;
  label: string;
  severity: AlertSeverity;
  description: string;
  recommendation: string;
}

export interface ProtectionAction {
  id: string;
  label: string;
  description: string;
  applied: boolean;
  appliedAt?: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "alert";
  riskLevel: "low" | "medium" | "high";
  riskScore?: number;
  thumbnail?: string;
  streamUrl?: string;
  rtspUrl?: string;
  lastActivity?: string;
  encryption?: {
    isEncrypted: boolean;
    protocol?: string;
  };
  vulnerabilities?: Vulnerability[];
  protections?: ProtectionAction[];
  lastScan?: string | null;
}

export interface Alert {
  id: string;
  cameraId: string;
  message: string;
  timestamp: string;
  severity: AlertSeverity;
  category?: string;
}

export interface IntrusionEvent {
  id: string;
  cameraId: string;
  type: string;
  severity: AlertSeverity;
  description: string;
  timestamp: string;
  status: string;
}

interface CameraStore {
  cameras: Camera[];
  selectedCamera: Camera | null;
  overallRisk: number;
  alerts: Alert[];
  intrusions: IntrusionEvent[];
  isHydrated: boolean;
  setSelectedCamera: (camera: Camera | null) => void;
  updateCameraStatus: (id: string, status: Camera["status"]) => void;
  addAlert: (alert: Alert) => void;
  setAlerts: (alerts: Alert[]) => void;
  setCameras: (cameras: Camera[]) => void;
  upsertCamera: (camera: Camera) => void;
  setOverallRisk: (score: number) => void;
  setIntrusions: (items: IntrusionEvent[]) => void;
  addIntrusion: (event: IntrusionEvent) => void;
  updateCameraStream: (cameraId: string, streamUrl?: string, rtspUrl?: string) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useCameraStore = create<CameraStore>((set, get) => ({
  cameras: [],
  selectedCamera: null,
  overallRisk: 0,
  alerts: [],
  intrusions: [],
  isHydrated: false,
  setSelectedCamera: (camera) =>
    set((state) => {
      if (!camera) return { selectedCamera: null };
      const match = state.cameras.find((cam) => cam.id === camera.id);
      return { selectedCamera: match ?? camera };
    }),
  updateCameraStatus: (id, status) =>
    set((state) => {
      const cameras = state.cameras.map((cam) =>
        cam.id === id ? { ...cam, status } : cam
      );
      const selectedCamera =
        state.selectedCamera?.id === id
          ? { ...state.selectedCamera, status }
          : state.selectedCamera;
      return { cameras, selectedCamera };
    }),
  addAlert: (alert) =>
    set((state) => {
      const exists = state.alerts.find((item) => item.id === alert.id);
      if (exists) return state;
      return { alerts: [alert, ...state.alerts].slice(0, 25) };
    }),
  setAlerts: (alerts) => set({ alerts }),
  setCameras: (cameras) =>
    set((state) => ({
      cameras,
      selectedCamera: state.selectedCamera
        ? cameras.find((cam) => cam.id === state.selectedCamera?.id) ??
          state.selectedCamera
        : null,
    })),
  upsertCamera: (camera) =>
    set((state) => {
      const exists = state.cameras.some((cam) => cam.id === camera.id);
      const cameras = exists
        ? state.cameras.map((cam) => (cam.id === camera.id ? camera : cam))
        : [camera, ...state.cameras];
      const selectedCamera =
        state.selectedCamera?.id === camera.id ? camera : state.selectedCamera;
      return { cameras, selectedCamera };
    }),
  setOverallRisk: (overallRisk) => set({ overallRisk }),
  setIntrusions: (items) => set({ intrusions: items }),
  addIntrusion: (event) =>
    set((state) => {
      const exists = state.intrusions.find((item) => item.id === event.id);
      if (exists) return state;
      return { intrusions: [event, ...state.intrusions].slice(0, 25) };
    }),
  updateCameraStream: (cameraId, streamUrl, rtspUrl) =>
    set((state) => {
      const cameras = state.cameras.map((cam) =>
        cam.id === cameraId ? { ...cam, streamUrl, rtspUrl: rtspUrl ?? cam.rtspUrl } : cam
      );
      const selectedCamera =
        state.selectedCamera?.id === cameraId
          ? { ...state.selectedCamera, streamUrl, rtspUrl: rtspUrl ?? state.selectedCamera.rtspUrl }
          : state.selectedCamera;
      return { cameras, selectedCamera };
    }),
  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
}));
