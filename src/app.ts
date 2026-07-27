import express from "express";
import { authRoutes } from "./modules/auth/auth.module.js";
import { deviceRoutes } from "./modules/device/device.module.js";
import { posRoutes } from "./modules/pos/pos.module.js";
import { env } from "./config/env.js";
import { errorHandler } from "./shared/errors/error-handler.js";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./docs/openapi.js";

const app = express();

app.use(express.json());

// Swagger Docs Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(generateOpenApiDocument()));

app.use("/auth", authRoutes);
app.use("/devices", deviceRoutes);
app.use("/pos", posRoutes);
app.use(errorHandler);

export default app;

app.listen(env.PORT, () => {
    console.log('Server running on port ', env.PORT)
})