import { motion } from 'framer-motion';
import { Camera } from '@/store/useCameraStore';
import { Maximize2, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface StreamPlayerProps {
  camera: Camera;
}

export const StreamPlayer = ({ camera }: StreamPlayerProps) => {
  const [isMuted, setIsMuted] = useState(true);

  const getRiskGlow = () => {
    switch (camera.riskLevel) {
      case 'high':
        return 'border-danger shadow-danger/30';
      case 'medium':
        return 'border-warning shadow-warning/30';
      default:
        return 'border-success shadow-success/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`stream-container ${getRiskGlow()} shadow-2xl`}
    >
      {/* Video container */}
      <div className="relative aspect-video bg-primary/5 overflow-hidden group">
        {camera.streamUrl ? (
          <motion.video
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            src={camera.streamUrl}
            autoPlay
            loop
            muted={isMuted}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted/20 mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-dashed border-muted-foreground/30 animate-spin" />
              </div>
              <p className="text-muted-foreground">Loading stream...</p>
            </div>
          </div>
        )}

        {/* Ambient glow overlay based on threat level */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            camera.riskLevel === 'high'
              ? 'bg-danger/10 opacity-100'
              : camera.riskLevel === 'medium'
              ? 'bg-warning/10 opacity-100'
              : 'opacity-0'
          }`}
        />

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-primary-foreground hover:text-primary-foreground hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary-foreground hover:text-primary-foreground hover:bg-white/20"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Live indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 glass px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
          <span className="text-xs font-medium text-foreground">LIVE</span>
        </div>

        {/* Risk indicator */}
        {camera.riskLevel !== 'low' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4"
          >
            <div
              className={`glass px-3 py-1.5 rounded-full font-semibold text-xs ${
                camera.riskLevel === 'high'
                  ? 'text-danger glow-danger'
                  : 'text-warning glow-warning'
              }`}
            >
              {camera.riskLevel.toUpperCase()} ALERT
            </div>
          </motion.div>
        )}
      </div>

      {/* Info bar */}
      <div className="p-4 bg-card/50 backdrop-blur-sm border-t border-border/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold text-foreground">{camera.name}</h3>
            <p className="text-sm text-muted-foreground">{camera.location}</p>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">RTSP Endpoint</div>
            <div className="text-sm font-medium text-foreground break-all">{camera.rtspUrl ?? 'Negotiating secure tunnel...'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Encryption</div>
            <div className="text-sm font-medium text-foreground">
              {camera.encryption?.isEncrypted ? camera.encryption?.protocol ?? 'Encrypted' : 'Unencrypted'}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Last Activity: <span className="text-foreground">{camera.lastActivity ?? 'unknown'}</span>
        </div>
      </div>
    </motion.div>
  );
};
