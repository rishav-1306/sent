import jwt from "jsonwebtoken";

const verifyAdmin = (req, res, next) => {
    try {
        const token = req.cookies?.cameraJWT;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();

    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized: Token has expired" });
        }
        if (e.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        console.error("Auth Middleware Error:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default verifyAdmin;