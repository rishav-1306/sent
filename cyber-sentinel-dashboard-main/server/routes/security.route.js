import express from "express";
import {
  createVirtualCamera,
  fetchSecurityState,
  hardenCamera,
  triggerVulnerabilityScan,
} from "../controllers/security.controller.js";
import verifyAdmin from "../middlewares/admin.middleware.js";

const securityRouter = express.Router();

securityRouter.use(verifyAdmin);
securityRouter.get("/state", fetchSecurityState);
securityRouter.post("/scan", triggerVulnerabilityScan);
securityRouter.post("/hardening", hardenCamera);
securityRouter.post("/cameras", createVirtualCamera);

export default securityRouter;

