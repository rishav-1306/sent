import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(409).json({ message: "Already Registered" });

        const hashPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            username,
            email,
            password: hashPassword,
        });

        await newAdmin.save();
        const token = jwt.sign({ _id: newAdmin._id }, process.env.JWT_SECRET, {
            expiresIn: "16h"
        });

        res.cookie("cameraJWT",token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV ==="production" ? "none":"Lax",
            maxAge: 16 * 60 * 60 * 1000,
        })

        res.status(201).json({
            message: "Admin Registered Successfully",
            email: newAdmin.email,
            username: newAdmin.username
        });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error",error:e.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: "Invalid Credentials" });
        const matchPassword = await bcrypt.compare(password, admin.password);
        if(!matchPassword) return res.status(404).json({message:"Invalid Credentials"});
        


        const token = jwt.sign({_id: admin._id},process.env.JWT_SECRET,{expiresIn:"16h"});

        res.cookie("cameraJWT",token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV ==="production" ? "none":"Lax",
            maxAge: 16 * 60 * 60 * 1000,
        })



        res.status(200).json({
            message: "Logged IN successfully",
            email: admin.email,
            username: admin.username
        });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("cameraJWT", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
        maxAge: 0
    });
    return res.status(200).json({
        success: true,
        message: "Logged Out Successfully"
    });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error",error:e.message });
    }
};