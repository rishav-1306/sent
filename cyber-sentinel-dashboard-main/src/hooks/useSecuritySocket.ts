import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api";
import { Alert, IntrusionEvent, useCameraStore } from "@/store/useCameraStore";

const socketRef: { current: Socket | null } = { current: null };

const emitRtspRequest = (cameraId: string) => {
  socketRef.current?.emit("rtsp:request", { cameraId });
};

export const useSecuritySocket = () => {
  const setCameras = useCameraStore((state) => state.setCameras);
  const addAlert = useCameraStore((state) => state.addAlert);
  const setAlerts = useCameraStore((state) => state.setAlerts);
  const addIntrusion = useCameraStore((state) => state.addIntrusion);
  const setIntrusions = useCameraStore((state) => state.setIntrusions);
  const setOverallRisk = useCameraStore((state) => state.setOverallRisk);
  const updateCameraStream = useCameraStore((state) => state.updateCameraStream);
  const upsertCamera = useCameraStore((state) => state.upsertCamera);
  const isHydrated = useCameraStore((state) => state.isHydrated);
  const setHydrated = useCameraStore((state) => state.setHydrated);

  const handlersRef = useRef({
    handleCameraInit: (payload: any[]) => {
      setCameras(payload);
      if (!isHydrated) setHydrated(true);
    },
    handleCameraUpdate: (payload: any) => {
      upsertCamera(payload);
    },
    handleAlertsInit: (payload: Alert[]) => setAlerts(payload),
    handleIntrusionsInit: (payload: IntrusionEvent[]) => setIntrusions(payload),
  });

  useEffect(() => {
    if (!socketRef.current) {
      console.log('Attempting to connect to WebSocket server at:', API_BASE_URL);
      socketRef.current = io(API_BASE_URL, {
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      // Add connection event listeners
      socketRef.current.on('connect', () => {
        console.log('WebSocket connected successfully');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });
    }
    const socket = socketRef.current;

    const handleCameraStream = (payload: { cameraId: string; streamUrl?: string; rtspUrl?: string }) => {
      updateCameraStream(payload.cameraId, payload.streamUrl, payload.rtspUrl);
    };

    socket.on("cameras:init", handlersRef.current.handleCameraInit);
    socket.on("camera:update", handlersRef.current.handleCameraUpdate);
    socket.on("camera:stream", handleCameraStream);
    socket.on("alerts:init", handlersRef.current.handleAlertsInit);
    socket.on("alert:new", addAlert);
    socket.on("intrusions:init", handlersRef.current.handleIntrusionsInit);
    socket.on("intrusion:new", addIntrusion);
    socket.on("risk:update", setOverallRisk);

    return () => {
      socket.off("cameras:init", handlersRef.current.handleCameraInit);
      socket.off("camera:update", handlersRef.current.handleCameraUpdate);
      socket.off("camera:stream", handleCameraStream);
      socket.off("alerts:init", handlersRef.current.handleAlertsInit);
      socket.off("alert:new", addAlert);
      socket.off("intrusions:init", handlersRef.current.handleIntrusionsInit);
      socket.off("intrusion:new", addIntrusion);
      socket.off("risk:update", setOverallRisk);
    };
  }, [addAlert, addIntrusion, setAlerts, setOverallRisk, setIntrusions, setCameras, upsertCamera, updateCameraStream, isHydrated, setHydrated]);

  return {
    socket: socketRef.current,
    requestRtspStream: emitRtspRequest,
  };
};

export const useSecuritySocketCommands = () => ({
  requestRtspStream: emitRtspRequest,
});

