import { EmployeeRepository } from "../repositories/employee.repository.js";
import { DeviceRepository } from "../../device/repositories/device.repository.js";
import { UnauthorizedError } from "../../../shared/errors/http-errors.js";

export class GetPosEmployeesUseCase {
    constructor(
        private readonly employeeRepository: EmployeeRepository,
        private readonly deviceRepository: DeviceRepository
    ) {}

    async execute(deviceToken: string) {
        const device = await this.deviceRepository.findByDeviceToken(deviceToken);

        if (!device || !device.isActive || !device.branchId) {
            throw new UnauthorizedError("Device is not configured or inactive");
        }

        const employees = await this.employeeRepository.findByBranchId(device.branchId);

        return employees.map(emp => ({
            id: emp.id,
            firstName: emp.user.firstName,
            lastName: emp.user.lastName,
            role: emp.role
        }));
    }
}
