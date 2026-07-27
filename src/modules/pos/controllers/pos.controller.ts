import type { Request, Response } from "express";
import type { GetPosEmployeesUseCase } from "../use-cases/get-pos-employees.use-case.js";
import type { PosLoginUseCase } from "../use-cases/pos-login.use-case.js";
import type { PosPauseSessionUseCase } from "../use-cases/pos-pause-session.use-case.js";
import type { PosCloseSessionUseCase } from "../use-cases/pos-close-session.use-case.js";

export class PosController {
    constructor(
        private readonly getEmployeesUseCase: GetPosEmployeesUseCase,
        private readonly loginUseCase: PosLoginUseCase,
        private readonly pauseSessionUseCase: PosPauseSessionUseCase,
        private readonly closeSessionUseCase: PosCloseSessionUseCase
    ) {}

    getEmployees = async (req: Request, res: Response): Promise<void> => {
        const deviceToken = req.headers["x-device-token"] as string;
        if (!deviceToken) {
            res.status(401).json({ message: "Missing device token" });
            return;
        }

        const employees = await this.getEmployeesUseCase.execute(deviceToken);
        res.status(200).json(employees);
    };

    login = async (req: Request, res: Response): Promise<void> => {
        const deviceToken = req.headers["x-device-token"] as string;
        if (!deviceToken) {
            res.status(401).json({ message: "Missing device token" });
            return;
        }

        const { employeeId, pinOrPassword, isPin } = req.body;
        const result = await this.loginUseCase.execute(deviceToken, employeeId, pinOrPassword, isPin);
        res.status(200).json(result);
    };

    pauseSession = async (req: Request, res: Response): Promise<void> => {
        // Assume posAuthMiddleware attaches the JWT payload to req.user
        const { sessionId, employeeId } = (req as any).user;
        const result = await this.pauseSessionUseCase.execute(sessionId, employeeId);
        res.status(200).json(result);
    };

    closeSession = async (req: Request, res: Response): Promise<void> => {
        const { sessionId, employeeId } = (req as any).user;
        const { shiftData } = req.body;
        const result = await this.closeSessionUseCase.execute(sessionId, employeeId, shiftData);
        res.status(200).json(result);
    };
}
