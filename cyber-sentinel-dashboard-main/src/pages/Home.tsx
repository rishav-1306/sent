import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Bell, Activity, Zap, Lock, TrendingUp, Video, Camera, Scan, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(smoothY, [-300, 300], [10, -10]);
  const rotateY = useTransform(smoothX, [-300, 300], [-10, 10]);
  const translateZ = useTransform(smoothY, [-300, 300], [-50, 50]);

  // Floating cameras positions
  const floatingCameras = [
    { x: 100, y: 100, delay: 0, icon: Camera },
    { x: 300, y: 200, delay: 0.5, icon: Video },
    { x: 500, y: 150, delay: 1, icon: Scan },
    { x: 200, y: 300, delay: 1.5, icon: Eye },
    { x: 400, y: 350, delay: 2, icon: Radar },
  ];

  const notifications = [
    { id: 1, icon: Eye, title: 'New Camera Online', desc: 'Parking Lot camera activated', time: '2m ago', color: 'success' },
    { id: 2, icon: Bell, title: 'Motion Detected', desc: 'Server Room - Unusual activity', time: '5m ago', color: 'warning' },
    { id: 3, icon: Activity, title: 'System Update', desc: 'Security patches applied', time: '10m ago', color: 'info' },
    { id: 4, icon: Zap, title: 'High Alert', desc: 'Unauthorized access attempt', time: '15m ago', color: 'danger' },
    { id: 5, icon: Video, title: 'Recording Started', desc: 'Main Entrance - Auto backup', time: '20m ago', color: 'success' },
    { id: 6, icon: Lock, title: 'Security Check', desc: 'All systems operational', time: '30m ago', color: 'success' },
  ];

  const stats = [
    { label: 'Active Cameras', value: '24', change: '+3', icon: Video },
    { label: 'Threats Blocked', value: '156', change: '+12', icon: Shield },
    { label: 'Uptime', value: '99.9%', change: '+0.1', icon: Activity },
    { label: 'Alerts Today', value: '8', change: '-2', icon: Bell },
  ];

  return (
    <div
      className="min-h-screen bg-background overflow-hidden relative cursor-none"
      onMouseMove={handleMouseMove}
    >
      {/* Custom Green Spotlight Cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-screen"
        animate={{
          x: cursorPos.x - 100,
          y: cursorPos.y - 100,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <div className="relative w-[200px] h-[200px]">
          <div className="absolute inset-0 bg-gradient-radial from-green-600/60 via-green-700/40 to-transparent rounded-full blur-2xl" />
          <div className="absolute inset-[25%] bg-gradient-radial from-green-500/80 via-green-600/50 to-transparent rounded-full blur-xl" />
          <div className="absolute inset-[40%] bg-green-600 rounded-full blur-md" />
        </div>
      </motion.div>
      {/* Animated background grid with perspective */}
      <div className="absolute inset-0 opacity-20" style={{ perspective: '1000px' }}>
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            rotateX: rotateX,
            rotateY: rotateY,
          }}
        />
      </div>

      {/* 3D Floating Camera Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ perspective: '1000px' }}>
        {floatingCameras.map((cam, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${cam.x}px`,
              top: `${cam.y}px`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotateY: [0, 360],
              rotateX: [0, 15, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: cam.delay,
            }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/30 to-primary/30 backdrop-blur-sm flex items-center justify-center shadow-2xl"
              whileHover={{ scale: 1.2, rotate: 180 }}
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateZ(50px)',
              }}
            >
              <cam.icon className="w-8 h-8 text-foreground/70" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Scanning radar effect */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full border-2 border-success/30 pointer-events-none"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0, 0.5],
          rotate: [0, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full border-2 border-warning/30 pointer-events-none"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.3, 0, 0.3],
          rotate: [360, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-success/20 to-info/20 rounded-full blur-3xl"
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotateY: [0, 360],
                rotateX: [0, 15, 0],
              }}
              transition={{
                rotateY: { duration: 5, repeat: Infinity, ease: 'linear' },
                rotateX: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileHover={{ 
                scale: 1.2, 
                rotateZ: 180,
                transition: { duration: 0.4 }
              }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-success flex items-center justify-center shadow-2xl glow-primary"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Shield className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SecureWatch</h1>
              <p className="text-xs text-muted-foreground">Enterprise Security Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 glass-panel px-4 py-2 rounded-xl">
              <Activity className="w-4 h-4 text-success animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="hover:bg-accent/20"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="btn-primary"
            >
              Get Started
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-block mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="glass-panel px-4 py-2 rounded-full inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">Live System Status</span>
              </div>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                Next-Gen
              </motion.span>
              <br />
              <motion.span 
                className="bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent inline-block"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  scale: [1, 1.02, 1],
                  rotateX: [0, 2, 0],
                }}
                transition={{ 
                  backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  rotateX: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
                style={{
                  backgroundSize: '200% auto',
                  transformStyle: 'preserve-3d',
                }}
              >
                Surveillance
              </motion.span>
              <br />
              Intelligence
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Real-time threat detection powered by AI. Monitor every corner with precision, 
              respond to incidents instantly, and keep your premises secure 24/7.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8" style={{ perspective: '1000px' }}>
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, rotateX: -20 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.08, 
                    rotateY: 5,
                    rotateX: 5,
                    z: 50,
                    transition: { duration: 0.3 }
                  }}
                  className="glass-panel p-4 rounded-xl cursor-pointer group"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5 text-accent" />
                    <span className={`text-xs font-semibold ${
                      stat.change.startsWith('+') ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-4">
              <motion.div
                whileHover={{ 
                  scale: 1.1, 
                  rotateY: 5,
                  rotateX: -5,
                  transition: { duration: 0.3 }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary group"
                  size="lg"
                >
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  View Dashboard
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ 
                  scale: 1.1, 
                  rotateY: -5,
                  rotateX: 5,
                  transition: { duration: 0.3 }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Button
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  size="lg"
                  className="glass border-border/50 hover:border-primary"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Notifications Feed */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: 20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ 
              rotateX, 
              rotateY, 
              transformStyle: 'preserve-3d',
              perspective: '1000px',
            }}
          >
            <motion.div 
              className="glass-panel p-6 rounded-3xl shadow-2xl"
              whileHover={{
                scale: 1.02,
                rotateY: -2,
                rotateX: 2,
                transition: { duration: 0.3 }
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-danger flex items-center justify-center"
                    animate={{
                      rotateY: [0, 360],
                      rotateZ: [0, 15, 0, -15, 0],
                    }}
                    transition={{
                      rotateY: { duration: 3, repeat: Infinity, ease: 'linear' },
                      rotateZ: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Bell className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Live Feed</h3>
                    <p className="text-xs text-muted-foreground">Real-time notifications</p>
                  </div>
                </div>
                <motion.div 
                  className="glass px-3 py-1 rounded-full"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <span className="text-xs font-semibold text-foreground">{notifications.length} New</span>
                </motion.div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent" style={{ perspective: '800px' }}>
                {notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 20, rotateY: 20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.03, 
                      x: -8,
                      rotateY: -5,
                      rotateX: 3,
                      z: 30,
                      transition: { duration: 0.2 }
                    }}
                    className={`glass-panel p-4 rounded-xl cursor-pointer border-l-4 ${
                      notif.color === 'danger' ? 'border-danger glow-danger' :
                      notif.color === 'warning' ? 'border-warning glow-warning' :
                      notif.color === 'success' ? 'border-success glow-safe' :
                      'border-info'
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          notif.color === 'danger' ? 'bg-danger/20' :
                          notif.color === 'warning' ? 'bg-warning/20' :
                          notif.color === 'success' ? 'bg-success/20' :
                          'bg-info/20'
                        }`}
                        whileHover={{
                          scale: 1.2,
                          rotateZ: 360,
                          transition: { duration: 0.5 }
                        }}
                        animate={{
                          rotateY: [0, 10, 0],
                        }}
                        transition={{
                          rotateY: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <notif.icon className={`w-5 h-5 ${
                          notif.color === 'danger' ? 'text-danger' :
                          notif.color === 'warning' ? 'text-warning' :
                          notif.color === 'success' ? 'text-success' :
                          'text-info'
                        }`} />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-foreground text-sm">{notif.title}</h4>
                          <span className="text-xs text-muted-foreground">{notif.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{notif.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ 
                  scale: 1.03,
                  rotateX: -2,
                  transition: { duration: 0.2 }
                }}
                className="mt-4 pt-4 border-t border-border/50"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full btn-glass"
                >
                  <TrendingUp className="w-4 h-4" />
                  View All Activity
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Home;
