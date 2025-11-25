import { motion } from 'framer-motion';
import { Camera } from '@/store/useCameraStore';
import { Video, MapPin, Activity } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface CameraCardProps {
  camera: Camera;
  onClick: () => void;
  index: number;
}

export const CameraCard = ({ camera, onClick, index }: CameraCardProps) => {
  const getRiskColor = () => {
    switch (camera.riskLevel) {
      case 'high':
        return 'glow-danger';
      case 'medium':
        return 'glow-warning';
      default:
        return 'glow-safe';
    }
  };

  const getStatusColor = () => {
    switch (camera.status) {
      case 'alert':
        return 'bg-danger';
      case 'offline':
        return 'bg-muted-foreground';
      default:
        return 'bg-success';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.03, rotateY: 5, rotateX: 5 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'camera-card group cursor-pointer',
        camera.status === 'alert' && getRiskColor()
      )}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full animate-pulse', getStatusColor())} />
          <Video className="w-5 h-5 text-foreground/70" />
        </div>
        <Badge
          className={cn(
            'text-xs font-medium',
            camera.riskLevel === 'high' && 'risk-high',
            camera.riskLevel === 'medium' && 'risk-medium',
            camera.riskLevel === 'low' && 'risk-low'
          )}
        >
          {camera.riskLevel}
        </Badge>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
        {camera.name}
      </h3>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <MapPin className="w-4 h-4" />
        <span>{camera.location}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="w-3 h-3" />
        <span>{camera.lastActivity}</span>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-accent to-transparent" />
    </motion.div>
  );
};
