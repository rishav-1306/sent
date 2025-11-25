import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, ShieldCheck, ListChecks, Wrench } from "lucide-react";
import { toast } from "sonner";

import { useCameraStore } from "@/store/useCameraStore";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useSecuritySocketCommands } from "@/hooks/useSecuritySocket";

const hardeningActions = [
  {
    id: "strong-password",
    label: "Strong Passwords",
  },
  {
    id: "close-ports",
    label: "Close Ports",
  },
  {
    id: "secure-stream",
    label: "Secure Stream",
  },
  {
    id: "update-firmware",
    label: "Patch Firmware",
  },
  {
    id: "block-attacker",
    label: "Block Attacker",
  },
];

const StreamView = () => {
  const navigate = useNavigate();
  const { selectedCamera, cameras, setCameras, upsertCamera, setOverallRisk } = useCameraStore();
  const { requestRtspStream } = useSecuritySocketCommands();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    if (selectedCamera) {
      requestRtspStream(selectedCamera.id);
    }
  }, [selectedCamera, requestRtspStream]);

  useEffect(() => {
    if (!selectedCamera) {
      navigate('/dashboard');
    }
  }, [selectedCamera, navigate]);

  if (!selectedCamera) {
    return null;
  }

  const relatedCameras = cameras.filter((c) => c.id !== selectedCamera.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-4 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-accent/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Live Stream</h1>
              <p className="text-sm text-muted-foreground">{selectedCamera.name}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <StreamPlayer camera={selectedCamera} />

          {/* Camera Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6 mt-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Camera Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-base font-medium text-foreground capitalize">
                  {selectedCamera.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-base font-medium text-foreground capitalize">
                  {selectedCamera.riskLevel}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-base font-medium text-foreground">
                  {selectedCamera.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Activity</p>
                <p className="text-base font-medium text-foreground">
                  {selectedCamera.lastActivity}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6 mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Vulnerability Findings
              </h3>
              <Button size="sm" variant="outline" onClick={async () => {
                setScanLoading(true);
                try {
                  const payload = await apiFetch<{ cameras: typeof cameras; overallRisk: number; message: string }>("/api/security/scan", {
                    method: "POST",
                    body: JSON.stringify({ cameraId: selectedCamera.id }),
                  });
                  setCameras(payload.cameras);
                  const updated = payload.cameras.find((cam) => cam.id === selectedCamera.id);
                  if (updated) {
                    upsertCamera(updated);
                  }
                  setOverallRisk(payload.overallRisk);
                  toast.success(payload.message ?? "Scan completed");
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Unable to scan camera";
                  toast.error(message);
                } finally {
                  setScanLoading(false);
                }
              }} disabled={scanLoading}>
                {scanLoading ? "Scanning..." : "Scan Camera"}
              </Button>
            </div>
            {selectedCamera.vulnerabilities && selectedCamera.vulnerabilities.length > 0 ? (
              <div className="space-y-3">
                {selectedCamera.vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className={`p-4 rounded-lg border ${
                      vuln.severity === "high"
                        ? "border-danger/40 bg-danger/5"
                        : vuln.severity === "medium"
                        ? "border-warning/30 bg-warning/5"
                        : "border-info/30 bg-info/5"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{vuln.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{vuln.description}</p>
                    <p className="text-xs text-info mt-2">{vuln.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active vulnerabilities detected.</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6 mt-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              Security Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedCamera.protections?.map((protection) => (
                <div
                  key={protection.id}
                  className={`p-3 rounded-xl border ${protection.applied ? "border-success/40 bg-success/5" : "border-border/40"}`}
                >
                  <p className="text-sm font-semibold text-foreground">{protection.label}</p>
                  <p className="text-xs text-muted-foreground">{protection.description}</p>
                  {protection.applied && (
                    <p className="text-xs text-success mt-2">
                      Applied {protection.appliedAt ? new Date(protection.appliedAt).toLocaleTimeString() : "recently"}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Apply Hardening</h4>
              <div className="flex flex-wrap gap-3">
                {hardeningActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="secondary"
                    className="gap-2"
                    disabled={actionLoading === action.id}
                    onClick={async () => {
                      setActionLoading(action.id);
                      try {
                        const payload = await apiFetch<{ camera: typeof selectedCamera; message: string }>("/api/security/hardening", {
                          method: "POST",
                          body: JSON.stringify({ cameraId: selectedCamera.id, action: action.id }),
                        });
                        upsertCamera(payload.camera);
                        toast.success(payload.message ?? `${action.label} applied`);
                      } catch (error) {
                        const message = error instanceof Error ? error.message : "Unable to apply hardening";
                        toast.error(message);
                      } finally {
                        setActionLoading(null);
                      }
                    }}
                  >
                    <Wrench className="w-4 h-4" />
                    {actionLoading === action.id ? "Applying..." : action.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Cameras */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-4"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Other Cameras</h3>
            <div className="space-y-3">
              {relatedCameras.map((camera, index) => (
                <motion.button
                  key={camera.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    useCameraStore.getState().setSelectedCamera(camera);
                    requestRtspStream(camera.id);
                  }}
                  className="w-full p-3 rounded-xl bg-card/50 hover:bg-card border border-border/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        camera.status === 'online'
                          ? 'bg-success'
                          : camera.status === 'alert'
                          ? 'bg-danger animate-pulse'
                          : 'bg-muted-foreground'
                      }`}
                    />
                    <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                      {camera.name}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{camera.location}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StreamView;
