import type { Request, Response } from "express";
import type { SetupDeviceUseCase } from "../use-cases/setup-device.use-case.js";

export class DeviceController {
    constructor(
        private readonly setupDeviceUseCase: SetupDeviceUseCase
    ) {}

    setupDevice = async (req: Request, res: Response): Promise<void> => {
        // Assume admin auth middleware populates req.user
        const adminEmployeeId = (req as any).user.employeeId; 
        const { companyId, branchId, deviceName } = req.body;
        
        const result = await this.setupDeviceUseCase.execute(adminEmployeeId, companyId, branchId, deviceName);
        res.status(201).json(result);
    };
}
