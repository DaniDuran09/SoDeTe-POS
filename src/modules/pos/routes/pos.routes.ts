import { Router } from "express";
import type { PosController } from "../controllers/pos.controller.js";
import type { PosAuthMiddleware } from "../../../shared/middlewares/pos-auth.middleware.js";

export const createPosRoutes = (
    controller: PosController,
    posAuthMiddleware: PosAuthMiddleware
): Router => {
    const router = Router();

    // Endpoints that require the hardware device token
    router.get("/employees", controller.getEmployees);
    router.post("/login", controller.login);

    // Endpoints that require an ACTIVE employee session (Contextual Auth)
    router.post(
        "/sessions/pause",
        posAuthMiddleware.handle,
        controller.pauseSession
    );

    router.post(
        "/sessions/close",
        posAuthMiddleware.handle,
        controller.closeSession
    );

    // Example of a protected POS operation:
    // router.post("/sell", posAuthMiddleware.handle, ...)

    return router;
}
