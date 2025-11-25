import {
  applyHardening,
  getSecurityState,
  registerVirtualCamera,
  runVulnerabilityScan,
} from "../services/security.service.js";

export const fetchSecurityState = (req, res) => {
  try {
    return res.json(getSecurityState());
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch security state", error: error.message });
  }
};

export const triggerVulnerabilityScan = (req, res) => {
  try {
    const payload = runVulnerabilityScan({ cameraId: req.body?.cameraId });
    return res.json({
      message: req.body?.cameraId ? "Camera scan completed" : "Full estate scan completed",
      ...payload,
    });
  } catch (error) {
    return res.status(500).json({ message: "Scan failed", error: error.message });
  }
};

export const hardenCamera = (req, res) => {
  try {
    const { cameraId, action } = req.body || {};
    if (!cameraId || !action) {
      return res.status(400).json({ message: "cameraId and action are required" });
    }
    const camera = applyHardening({ cameraId, action });
    return res.json({ message: "Security hardening applied", camera });
  } catch (error) {
    return res.status(500).json({ message: "Hardening failed", error: error.message });
  }
};

export const createVirtualCamera = (req, res) => {
  try {
    const camera = registerVirtualCamera(req.body ?? {});
    return res.status(201).json({ message: "Virtual camera created", camera });
  } catch (error) {
    return res.status(400).json({ message: "Unable to create camera", error: error.message });
  }
};


