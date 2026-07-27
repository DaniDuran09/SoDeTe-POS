import crypto from "crypto";
import type { DeviceRepository } from "../repositories/device.repository.js";
import { UnauthorizedError } from "../../../shared/errors/http-errors.js";
import type { EmployeeRepository } from "../../pos/repositories/employee.repository.js";

export class SetupDeviceUseCase {
    constructor(
        private readonly deviceRepository: DeviceRepository,
        private readonly employeeRepository: EmployeeRepository
    ) {}

    async execute(adminEmployeeId: string, companyId: string, branchId: string, deviceName: string) {
        // Verify the admin has access to this branch and is an OWNER or ADMIN
        const adminEmployee = await this.employeeRepository.findById(adminEmployeeId);
        
        if (!adminEmployee || adminEmployee.companyId !== companyId) {
            throw new UnauthorizedError("Invalid admin employee context");
        }

        if (adminEmployee.role !== "OWNER" && adminEmployee.role !== "ADMIN") {
            throw new UnauthorizedError("Only OWNER or ADMIN can setup a device");
        }

        const access = await this.employeeRepository.verifyAccessToBranch(adminEmployeeId, branchId);
        
        // Owners implicitly have access to everything, but for strictness we might require explicit access.
        if (!access && adminEmployee.role !== "OWNER") {
            throw new UnauthorizedError("Admin does not have access to this branch");
        }

        // Generate a permanent device token
        const deviceToken = crypto.randomBytes(32).toString('hex');

        // Create the device already configured
        const device = await this.deviceRepository.createConfigured(companyId, branchId, deviceName, deviceToken);

        return {
            success: true,
            deviceId: device.id,
            deviceToken: device.deviceToken
        };
    }
}
