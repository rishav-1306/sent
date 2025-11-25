import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shield, Bell, Grid3x3, LogOut, ScanLine, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { useCameraStore } from "@/store/useCameraStore";
import { CameraCard } from "@/components/CameraCard";
import { RiskScore } from "@/components/RiskScore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useSecuritySocketCommands } from "@/hooks/useSecuritySocket";
import { useAuthStore } from "@/store/useAuthStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const { cameras, overallRisk, alerts, intrusions, setSelectedCamera, setCameras, setAlerts, setIntrusions, setOverallRisk, upsertCamera, isHydrated } =
    useCameraStore();
  const logout = useAuthStore((state) => state.logout);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [cameraForm, setCameraForm] = useState({
    name: "",
    location: "",
    streamUrl: "",
    rtspUrl: "",
  });
  const [isCreatingCamera, setIsCreatingCamera] = useState(false);

  const { requestRtspStream } = useSecuritySocketCommands();
  useQuery({
    queryKey: ["security-state"],
    queryFn: () =>
      apiFetch<{
        cameras: typeof cameras;
        alerts: typeof alerts;
        intrusions: typeof intrusions;
        overallRisk: number;
      }>("/api/security/state"),
    onSuccess: (data) => {
      setCameras(data.cameras);
      setAlerts(data.alerts);
      setIntrusions(data.intrusions);
      setOverallRisk(data.overallRisk);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Session expired";
      toast.error(message);
      logout();
      navigate("/login");
    },
    refetchInterval: 60000,
  });

  const handleCameraClick = (camera: typeof cameras[0]) => {
    setSelectedCamera(camera);
    requestRtspStream(camera.id);
    navigate('/stream');
  };

  const handleRunScan = async () => {
    setIsScanLoading(true);
    try {
      const payload = await apiFetch<{
        message: string;
        cameras: typeof cameras;
        overallRisk: number;
      }>("/api/security/scan", {
        method: "POST",
        body: JSON.stringify({ scope: "all" }),
      });
      setCameras(payload.cameras);
      setOverallRisk(payload.overallRisk);
      toast.success(payload.message ?? "Vulnerability scan completed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete scan";
      toast.error(message);
    } finally {
      setIsScanLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore logout errors to avoid blocking UI
    } finally {
      logout();
      navigate("/login");
    }
  };

  const handleCreateCamera = async () => {
    if (!cameraForm.name || !cameraForm.location || !cameraForm.streamUrl) {
      toast.error("Name, location and stream URL are required");
      return;
    }
    setIsCreatingCamera(true);
    try {
      const payload = await apiFetch<{ camera: typeof cameras[0]; message: string }>("/api/security/cameras", {
        method: "POST",
        body: JSON.stringify(cameraForm),
      });
      upsertCamera(payload.camera);
      toast.success(payload.message ?? "Virtual camera added");
      setIsCameraDialogOpen(false);
      setCameraForm({ name: "", location: "", streamUrl: "", rtspUrl: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create camera";
      toast.error(message);
    } finally {
      setIsCreatingCamera(false);
    }
  };

  const stats = {
    online: cameras.filter((c) => c.status === 'online').length,
    alerts: cameras.filter((c) => c.status === 'alert').length,
    total: cameras.length,
    intrusions: intrusions.length,
  };

  const getAlertStyles = (severity: string) => {
    if (severity === 'high') {
      return 'bg-danger/10 border-danger/30';
    }
    if (severity === 'medium') {
      return 'bg-warning/10 border-warning/30';
    }
    if (severity === 'info' || severity === 'low') {
      return 'bg-info/10 border-info/30';
    }
    return 'bg-muted/10 border-border';
  };

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SecureWatch</h1>
              <p className="text-sm text-muted-foreground">Surveillance Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="relative hover:bg-accent/20"
              onClick={() => navigate('/')}
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-danger text-white text-xs animate-pulse">
                  {alerts.length}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Add Virtual Camera
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Virtual Camera</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="camera-name">Name</Label>
                    <Input
                      id="camera-name"
                      value={cameraForm.name}
                      onChange={(event) => setCameraForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Loading Bay"
                    />
                  </div>
                  <div>
                    <Label htmlFor="camera-location">Location</Label>
                    <Input
                      id="camera-location"
                      value={cameraForm.location}
                      onChange={(event) => setCameraForm((prev) => ({ ...prev, location: event.target.value }))}
                      placeholder="Building C - Dock"
                    />
                  </div>
                  <div>
                    <Label htmlFor="camera-stream">Video File URL</Label>
                    <Input
                      id="camera-stream"
                      value={cameraForm.streamUrl}
                      onChange={(event) => setCameraForm((prev) => ({ ...prev, streamUrl: event.target.value }))}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="camera-rtsp">RTSP URL (optional)</Label>
                    <Input
                      id="camera-rtsp"
                      value={cameraForm.rtspUrl}
                      onChange={(event) => setCameraForm((prev) => ({ ...prev, rtspUrl: event.target.value }))}
                      placeholder="rtsp://..."
                    />
                  </div>
                  <Button className="w-full" onClick={handleCreateCamera} disabled={isCreatingCamera}>
                    {isCreatingCamera ? "Provisioning..." : "Create Camera"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.header>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Online Cameras</p>
              <p className="text-3xl font-bold text-success">{stats.online}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <Grid3x3 className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-3xl font-bold text-danger">{stats.alerts}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-danger animate-pulse" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cameras</p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Intrusions Blocked</p>
              <p className="text-3xl font-bold text-info">{stats.intrusions}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
              <ScanLine className="w-6 h-6 text-info" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Camera Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold text-foreground flex items-center gap-2"
            >
              <Grid3x3 className="w-5 h-5" />
              Camera Feeds
            </motion.h2>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleRunScan}
              disabled={isScanLoading}
            >
              <ScanLine className="w-4 h-4" />
              {isScanLoading ? "Scanning..." : "Run Full Scan"}
            </Button>
          </div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2"
          >
            <Grid3x3 className="w-5 h-5" />
            Camera Feeds
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.length === 0 && !isHydrated ? (
              <div className="col-span-2 text-center text-muted-foreground py-12">
                Loading secure feeds...
              </div>
            ) : (
              cameras.map((camera, index) => (
                <CameraCard
                  key={camera.id}
                  camera={camera}
                  onClick={() => handleCameraClick(camera)}
                  index={index}
                />
              ))
            )}
          </div>
        </div>

        {/* Risk Score & Alerts */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RiskScore score={overallRisk} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Alerts
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`p-3 rounded-lg border ${getAlertStyles(alert.severity)}`}
                  >
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active alerts
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Intrusion Activity
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {intrusions.length > 0 ? (
                intrusions.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${getAlertStyles(event.severity)}`}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {event.type.replace('-', ' ')} — {event.status}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent intrusion attempts
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
