import { env } from "../../config/env.js";
import { prisma } from "../../database/prisma.js";
import { PrismaDeviceRepository } from "./repositories/prisma-device.repository.js";
import { SetupDeviceUseCase } from "./use-cases/setup-device.use-case.js";
import { DeviceController } from "./controllers/device.controller.js";
import { createDeviceRoutes } from "./routes/device.routes.js";
import { AuthMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { JwtAdapter } from "../../shared/security/adapters/token/jwt.adapter.js";
import { PrismaEmployeeRepository } from "../pos/repositories/prisma-employee.repository.js";

const deviceRepository = new PrismaDeviceRepository(prisma);
const employeeRepository = new PrismaEmployeeRepository(prisma);

const tokenAdapter = new JwtAdapter(env.JWT_SECRET, env.JWT_ACCESS_EXPIRES_IN);
const authMiddleware = new AuthMiddleware(tokenAdapter);

const setupDeviceUseCase = new SetupDeviceUseCase(deviceRepository, employeeRepository);

const deviceController = new DeviceController(setupDeviceUseCase);

export const deviceRoutes = createDeviceRoutes(deviceController, authMiddleware);
