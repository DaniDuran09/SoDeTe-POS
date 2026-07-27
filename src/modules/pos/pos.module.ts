import { env } from "../../config/env.js";
import { prisma } from "../../database/prisma.js";
import { PrismaDeviceRepository } from "../device/repositories/prisma-device.repository.js";
import { PrismaEmployeeRepository } from "./repositories/prisma-employee.repository.js";
import { PrismaEmployeeSessionRepository } from "./repositories/prisma-employee-session.repository.js";
import { BcryptAdapter } from "../../shared/security/adapters/hash/bcrypt.adapter.js";
import { JwtAdapter } from "../../shared/security/adapters/token/jwt.adapter.js";
import { PosAuthMiddleware } from "../../shared/middlewares/pos-auth.middleware.js";

import { GetPosEmployeesUseCase } from "./use-cases/get-pos-employees.use-case.js";
import { PosLoginUseCase } from "./use-cases/pos-login.use-case.js";
import { PosPauseSessionUseCase } from "./use-cases/pos-pause-session.use-case.js";
import { PosCloseSessionUseCase } from "./use-cases/pos-close-session.use-case.js";
import { PosController } from "./controllers/pos.controller.js";
import { createPosRoutes } from "./routes/pos.routes.js";

const deviceRepository = new PrismaDeviceRepository(prisma);
const employeeRepository = new PrismaEmployeeRepository(prisma);
const sessionRepository = new PrismaEmployeeSessionRepository(prisma);

const hashAdapter = new BcryptAdapter(env.BCRYPT_SALT_ROUNDS);
const tokenAdapter = new JwtAdapter(env.JWT_SECRET, env.JWT_ACCESS_EXPIRES_IN);

const posAuthMiddleware = new PosAuthMiddleware(tokenAdapter);

const getEmployeesUseCase = new GetPosEmployeesUseCase(employeeRepository, deviceRepository);
const loginUseCase = new PosLoginUseCase(
    employeeRepository, 
    deviceRepository, 
    sessionRepository, 
    hashAdapter, 
    tokenAdapter
);
const pauseSessionUseCase = new PosPauseSessionUseCase(sessionRepository);
const closeSessionUseCase = new PosCloseSessionUseCase(sessionRepository);

const posController = new PosController(
    getEmployeesUseCase,
    loginUseCase,
    pauseSessionUseCase,
    closeSessionUseCase
);

export const posRoutes = createPosRoutes(posController, posAuthMiddleware);
