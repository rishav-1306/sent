import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const severityWeight = {
  low: 5,
  medium: 15,
  high: 30,
};

const vulnerabilityCatalog = [
  {
    id: "weak-password",
    label: "Weak Password Policy",
    severity: "high",
    description: "Camera credentials can be guessed with a short brute-force attack.",
    recommendation: "Enforce strong password rotation and MFA for remote access.",
  },
  {
    id: "open-rtsp",
    label: "Exposed RTSP Stream",
    severity: "high",
    description: "RTSP stream is accessible without encryption over public network.",
    recommendation: "Tunnel the stream through TLS and restrict access by IP.",
  },
  {
    id: "open-ports",
    label: "Risky Open Ports",
    severity: "medium",
    description: "Unused TCP/UDP ports are exposed to the internet.",
    recommendation: "Close ports 23, 554, 8000 unless strictly required.",
  },
  {
    id: "outdated-firmware",
    label: "Outdated Firmware",
    severity: "medium",
    description: "Camera firmware is 18 months out of date.",
    recommendation: "Apply vendor patches to prevent known exploits.",
  },
  {
    id: "unencrypted-storage",
    label: "Missing Encryption at Rest",
    severity: "low",
    description: "Video footage stored without encryption.",
    recommendation: "Enable AES-256 encryption for storage volumes.",
  },
];

const protectionLibrary = {
  "strong-password": {
    id: "strong-password",
    label: "Enforce Strong Passwords",
    description: "Apply random 16-char credentials & rotate automatically.",
    targets: ["weak-password"],
  },
  "close-ports": {
    id: "close-ports",
    label: "Close Risky Ports",
    description: "Shut down Telnet/RTSP ports & restrict inbound firewall rules.",
    targets: ["open-ports"],
  },
  "secure-stream": {
    id: "secure-stream",
    label: "Secure Streams w/ TLS",
    description: "Proxy RTSP stream through TLS w/ rotating keys.",
    targets: ["open-rtsp"],
  },
  "block-attacker": {
    id: "block-attacker",
    label: "Block Active Attacker",
    description: "Blacklist offending IPs & rate-limit brute-force attempts.",
  },
  "update-firmware": {
    id: "update-firmware",
    label: "Patch Firmware",
    description: "Roll out vendor firmware updates & reboot safely.",
    targets: ["outdated-firmware"],
  },
};

const sampleVideos = [
  {
    id: "cam-entrance",
    name: "Main Entrance",
    location: "HQ - Lobby",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    rtspUrl: "rtsp://10.1.10.12:554/main",
  },
  {
    id: "cam-parking",
    name: "Parking Lot",
    location: "North Garage",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    rtspUrl: "rtsp://10.1.10.32:554/parking",
  },
  {
    id: "cam-server-room",
    name: "Server Room",
    location: "Building B - Basement",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    rtspUrl: "rtsp://10.1.10.61:554/core",
  },
  {
    id: "cam-lobby",
    name: "Executive Lobby",
    location: "Building A - Floor 1",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    rtspUrl: "rtsp://10.1.10.22:554/lobby",
  },
];

const buildProtectionState = () =>
  Object.values(protectionLibrary).reduce((acc, protection) => {
    acc[protection.id] = {
      ...protection,
      applied: false,
    };
    return acc;
  }, {});

const baseCamera = (seed) => {
  const baseScore = 25 + Math.random() * 35;
  return {
    id: seed.id ?? randomUUID(),
    name: seed.name,
    location: seed.location,
    status: seed.status ?? "online",
    riskLevel: seed.riskLevel ?? "medium",
    riskScore: seed.riskScore ?? Math.round(baseScore),
    baseScore,
    streamUrl: seed.streamUrl,
    rtspUrl: seed.rtspUrl,
    lastActivity: seed.lastActivity ?? "Just now",
    encryption: seed.encryption ?? { isEncrypted: true, protocol: "TLS 1.3" },
    vulnerabilities: seed.vulnerabilities ?? [],
    protections: seed.protections ?? buildProtectionState(),
    createdAt: new Date().toISOString(),
    lastScan: null,
  };
};

const cameraStore = new Map(sampleVideos.map((video) => [video.id, baseCamera(video)]));

let alerts = [
  {
    id: randomUUID(),
    cameraId: "cam-server-room",
    severity: "high",
    message: "Unauthorized access detected in Server Room",
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    category: "intrusion",
  },
  {
    id: randomUUID(),
    cameraId: "cam-parking",
    severity: "medium",
    message: "Motion detected after hours - Parking",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    category: "motion",
  },
];

let intrusions = [
  {
    id: randomUUID(),
    cameraId: "cam-entrance",
    type: "brute-force",
    severity: "medium",
    description: "Repeated credential guessing blocked",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "blocked",
  },
];

let ioInstance = null;
let loopsStarted = false;

const toCameraDto = (camera) => ({
  id: camera.id,
  name: camera.name,
  location: camera.location,
  status: camera.status,
  riskLevel: camera.riskLevel,
  riskScore: camera.riskScore,
  streamUrl: camera.streamUrl,
  rtspUrl: camera.rtspUrl,
  lastActivity: camera.lastActivity,
  encryption: camera.encryption,
  vulnerabilities: camera.vulnerabilities,
  protections: Object.values(camera.protections ?? {}),
  lastScan: camera.lastScan,
});

const getTokenFromCookie = (cookieHeader = "") => {
  return cookieHeader
    ?.split(";")
    .map((chunk) => chunk.trim().split("="))
    .find(([key]) => key === "cameraJWT")?.[1];
};

const emitCameraUpdate = (camera) => {
  if (!ioInstance) return;
  ioInstance.emit("camera:update", toCameraDto(camera));
};

const emitAlert = (alert) => {
  if (!ioInstance) return;
  ioInstance.emit("alert:new", alert);
};

const emitIntrusion = (event) => {
  if (!ioInstance) return;
  ioInstance.emit("intrusion:new", event);
};

const emitRisk = () => {
  if (!ioInstance) return;
  ioInstance.emit("risk:update", calculateOverallRisk());
};

const pushAlert = (alert) => {
  alerts = [alert, ...alerts].slice(0, 25);
  emitAlert(alert);
};

const pushIntrusion = (event) => {
  intrusions = [event, ...intrusions].slice(0, 25);
  emitIntrusion(event);
};

const recomputeCameraRisk = (camera) => {
  const vulnPenalty = (camera.vulnerabilities ?? []).reduce(
    (total, vuln) => total + severityWeight[vuln.severity],
    0
  );
  const protectionBonus = Object.values(camera.protections ?? {}).reduce(
    (total, protection) => (protection.applied ? total + 6 : total),
    0
  );
  const score = Math.min(95, Math.max(5, Math.round(camera.baseScore + vulnPenalty - protectionBonus)));
  camera.riskScore = score;
  camera.riskLevel = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  if (camera.riskLevel === "high") {
    camera.status = "alert";
  } else if (camera.status !== "offline") {
    camera.status = "online";
  }
};

const randomVulnerabilities = () => {
  const count = Math.floor(Math.random() * 3);
  const shuffled = [...vulnerabilityCatalog].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const intrusionTemplates = [
  {
    type: "rtsp-hijack",
    severity: "high",
    description: "Unauthorized RTSP subscription detected",
    message: "Unauthorized stream pull attempt blocked",
  },
  {
    type: "brute-force",
    severity: "medium",
    description: "Repeated login attempts from unknown host",
    message: "Brute-force password attack mitigated",
  },
  {
    type: "port-scan",
    severity: "medium",
    description: "Ports 23/554 scanned externally",
    message: "Port scanning source quarantined",
  },
];

const simulateIntrusion = () => {
  const cameras = Array.from(cameraStore.values());
  if (cameras.length === 0) return;
  const camera = cameras[Math.floor(Math.random() * cameras.length)];
  const template = intrusionTemplates[Math.floor(Math.random() * intrusionTemplates.length)];
  const event = {
    id: randomUUID(),
    cameraId: camera.id,
    type: template.type,
    severity: template.severity,
    description: template.description,
    timestamp: new Date().toISOString(),
    status: "blocked",
  };

  camera.lastActivity = "Intrusion blocked just now";
  if (template.severity === "high") {
    camera.status = "alert";
  }

  pushIntrusion(event);
  pushAlert({
    id: randomUUID(),
    cameraId: camera.id,
    severity: template.severity,
    message: `${camera.name}: ${template.message}`,
    timestamp: event.timestamp,
    category: "intrusion",
  });
  recomputeCameraRisk(camera);
  emitCameraUpdate(camera);
  emitRisk();
};

const startLoops = () => {
  if (loopsStarted) return;
  loopsStarted = true;
  setInterval(simulateIntrusion, 25000);
  setInterval(() => {
    const cameras = Array.from(cameraStore.values());
    cameras.forEach((camera) => {
      if (Math.random() > 0.6) return;
      camera.lastActivity = `${Math.floor(Math.random() * 5) + 1} mins ago`;
      if (camera.status === "alert" && camera.riskLevel !== "high") {
        camera.status = "online";
      }
      emitCameraUpdate(camera);
    });
  }, 20000);
};

export const attachSecuritySocket = (io) => {
  io.use((socket, next) => {
    const token = getTokenFromCookie(socket.handshake.headers.cookie || "");
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      next(error);
    }
  });

  ioInstance = io;
  startLoops();

  io.on("connection", (socket) => {
    socket.emit("cameras:init", Array.from(cameraStore.values()).map(toCameraDto));
    socket.emit("alerts:init", alerts);
    socket.emit("intrusions:init", intrusions);
    socket.emit("risk:update", calculateOverallRisk());

    socket.on("rtsp:request", ({ cameraId }) => {
      const camera = cameraStore.get(cameraId);
      if (!camera) return;
      socket.emit("camera:stream", {
        cameraId,
        streamUrl: camera.streamUrl,
        rtspUrl: camera.rtspUrl,
        encryption: camera.encryption,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {});
  });
};

export const calculateOverallRisk = () => {
  const cameras = Array.from(cameraStore.values());
  if (cameras.length === 0) return 0;
  const total = cameras.reduce((sum, cam) => sum + (cam.riskScore ?? 0), 0);
  return Math.round(total / cameras.length);
};

export const getSecurityState = () => ({
  cameras: Array.from(cameraStore.values()).map(toCameraDto),
  alerts,
  intrusions,
  overallRisk: calculateOverallRisk(),
});

export const runVulnerabilityScan = ({ cameraId }) => {
  const targets = cameraId ? [cameraStore.get(cameraId)].filter(Boolean) : Array.from(cameraStore.values());
  if (cameraId && targets.length === 0) {
    throw new Error("Camera not found");
  }
  const findings = {};
  targets.forEach((camera) => {
    const vulns = randomVulnerabilities();
    camera.vulnerabilities = vulns;
    camera.lastScan = new Date().toISOString();
    camera.lastActivity = "Security scan completed";
    recomputeCameraRisk(camera);
    emitCameraUpdate(camera);
    findings[camera.id] = vulns;
  });
  emitRisk();
  return {
    findings,
    cameras: Array.from(cameraStore.values()).map(toCameraDto),
    overallRisk: calculateOverallRisk(),
  };
};

export const applyHardening = ({ cameraId, action }) => {
  const camera = cameraStore.get(cameraId);
  if (!camera) {
    throw new Error("Camera not found");
  }
  const protection = protectionLibrary[action];
  if (!protection) {
    throw new Error("Unknown action");
  }

  camera.protections[action] = {
    ...protection,
    applied: true,
    appliedAt: new Date().toISOString(),
  };
  if (Array.isArray(protection.targets) && camera.vulnerabilities?.length) {
    camera.vulnerabilities = camera.vulnerabilities.filter(
      (vuln) => !protection.targets.includes(vuln.id)
    );
  }
  camera.lastActivity = `${protection.label} applied`;
  recomputeCameraRisk(camera);
  emitCameraUpdate(camera);
  emitRisk();

  pushAlert({
    id: randomUUID(),
    cameraId,
    severity: "info",
    message: `${protection.label} executed on ${camera.name}`,
    timestamp: new Date().toISOString(),
    category: "hardening",
  });

  return toCameraDto(camera);
};

export const registerVirtualCamera = ({ name, location, streamUrl, rtspUrl }) => {
  if (!name || !location || !streamUrl) {
    throw new Error("Name, location and streamUrl are required");
  }
  const camera = baseCamera({
    name,
    location,
    streamUrl,
    rtspUrl: rtspUrl || `rtsp://virtual/${name.toLowerCase().replace(/\s+/g, "-")}`,
  });
  camera.vulnerabilities = randomVulnerabilities();
  recomputeCameraRisk(camera);
  cameraStore.set(camera.id, camera);
  emitCameraUpdate(camera);
  emitRisk();
  return toCameraDto(camera);
};

