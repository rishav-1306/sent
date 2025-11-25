

## Cyber Sentinel Dashboard

Virtual CCTV command center that provisions streams from video files, performs vulnerability scanning, detects intrusions in real-time, and applies hardening policies through a secure dashboard.

### Stack

- Vite + React + TypeScript
- Zustand state management
- shadcn/ui + Tailwind CSS
- Express + Socket.io backend
- MongoDB (admin auth)

### Features

- Create virtual CCTV cameras from any MP4/RTSP source.
- Authenticated dashboard with live risk score, alerts, and intrusion log.
- Socket.io delivers real-time camera status, RTSP negotiations, and alerts.
- One-click vulnerability scans plus remediation actions (strong passwords, closed ports, TLS streams, firmware patches, attacker blocking).
- Stream viewer shows encrypted RTSP endpoint info and per-camera findings.

### Prerequisites

- Node.js 18+
- MongoDB URI (for admin accounts)

### Environment

Create a `.env` file at the project root:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/cyber-sentinel
JWT_SECRET=super-secret-string
CLIENT_URL=http://localhost:5173
```

For the frontend create `cyber-sentinel-dashboard-main/.env`:

```
VITE_API_URL=http://localhost:4000
```

### Install & Run

```bash
# backend
cd server
npm install
npm run dev

# frontend
cd ../
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173` and proxies API/socket calls to `http://localhost:4000`.

### Test Credentials

Use `/signup` to create an admin. Sessions are stored via secure HTTP-only cookies plus a local storage hint for client routing.

### Notes

- Socket connections are authenticated with the same JWT cookie.
- Vulnerability/intrusion events are simulated to keep the dashboard lively even without physical cameras.
