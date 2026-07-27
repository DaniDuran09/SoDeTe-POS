import { Router } from "express";
import type { DeviceController } from "../controllers/device.controller.js";
import { AuthMiddleware } from "../../../shared/middlewares/auth.middleware.js";

export const createDeviceRoutes = (
    controller: DeviceController,
    authMiddleware: AuthMiddleware
): Router => {
    const router = Router();

    // The admin logs in (with their global JWT) on the unconfigured tablet
    // and calls this to configure it.
    router.post("/setup", authMiddleware.handle, controller.setupDevice);

    return router;
}
