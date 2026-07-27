import { EmployeeRepository } from "../repositories/employee.repository.js";
import { DeviceRepository } from "../../device/repositories/device.repository.js";
import { EmployeeSessionRepository } from "../repositories/employee-session.repository.js";
import { UnauthorizedError, ConflictError } from "../../../shared/errors/http-errors.js";
import type { HashAdapter } from "../../../shared/security/interfaces/hash.adapter.js";
import type { TokenAdapter } from "../../../shared/security/interfaces/token.adapter.js";

export class PosLoginUseCase {
    constructor(
        private readonly employeeRepository: EmployeeRepository,
        private readonly deviceRepository: DeviceRepository,
        private readonly sessionRepository: EmployeeSessionRepository,
        private readonly hashAdapter: HashAdapter,
        private readonly tokenAdapter: TokenAdapter
    ) {}

    async execute(deviceToken: string, employeeId: string, pinOrPassword: string, isPin: boolean) {
        const device = await this.deviceRepository.findByDeviceToken(deviceToken);

        if (!device || !device.isActive || !device.branchId || !device.companyId) {
            throw new UnauthorizedError("Device is not configured or inactive");
        }

        const employee = await this.employeeRepository.findById(employeeId);
        
        if (!employee || employee.companyId !== device.companyId) {
            throw new UnauthorizedError("Invalid employee");
        }

        const access = await this.employeeRepository.verifyAccessToBranch(employeeId, device.branchId);
        if (!access && employee.role !== "OWNER") {
            throw new UnauthorizedError("Employee does not have access to this branch");
        }

        let isValid = false;
        if (isPin) {
            if (!employee.pinHash) throw new UnauthorizedError("PIN not configured");
            isValid = await this.hashAdapter.compare(pinOrPassword, employee.pinHash);
        } else {
            isValid = await this.hashAdapter.compare(pinOrPassword, employee.user.passwordHash);
        }

        if (!isValid) {
            throw new UnauthorizedError("Invalid credentials");
        }

        // Concurrency constraint: Only one ACTIVE session per device
        const activeSession = await this.sessionRepository.findActiveSessionByDevice(device.id);
        if (activeSession) {
            if (activeSession.employeeId === employeeId) {
                // If it's the same employee, maybe they refreshed or the token expired. We can continue or close it and create a new one.
                await this.sessionRepository.updateStatus(activeSession.id, "CLOSED");
                await this.sessionRepository.logAudit(activeSession.id, "FORCE_CLOSED_BY_NEW_LOGIN");
            } else {
                throw new ConflictError("Another employee is currently active on this device. They must pause or close their session.");
            }
        }

        const session = await this.sessionRepository.createSession(device.id, employeeId);
        await this.sessionRepository.logAudit(session.id, "LOGIN");

        const permissions = access ? access.permissions : [];

        const accessToken = await this.tokenAdapter.sign({
            sub: employee.user.id,
            employeeId: employee.id,
            companyId: device.companyId,
            branchId: device.branchId,
            deviceId: device.id,
            sessionId: session.id,
            role: employee.role,
            permissions
        });

        return {
            accessToken,
            employee: {
                id: employee.id,
                firstName: employee.user.firstName,
                lastName: employee.user.lastName,
                role: employee.role,
                permissions
            }
        };
    }
}
