import express from "express";
import { authRoutes } from "./modules/auth/auth.module.js";
import { deviceRoutes } from "./modules/device/device.module.js";
import { posRoutes } from "./modules/pos/pos.module.js";
import { env } from "./config/env.js";
import { errorHandler } from "./shared/errors/error-handler.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/devices", deviceRoutes);
app.use("/pos", posRoutes);
app.use(errorHandler);

export default app;

app.listen(env.PORT, () => {
    console.log('Server running on port ', env.PORT)
})