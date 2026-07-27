import { EmployeeSessionRepository } from "../repositories/employee-session.repository.js";
import { UnauthorizedError, NotFoundError, BadRequestError } from "../../../shared/errors/http-errors.js";

export class PosCloseSessionUseCase {
    constructor(private readonly sessionRepository: EmployeeSessionRepository) {}

    async execute(sessionId: string, employeeId: string, shiftData: any) {
        const session = await this.sessionRepository.findById(sessionId);

        if (!session) {
            throw new NotFoundError("Session not found");
        }

        if (session.employeeId !== employeeId) {
            throw new UnauthorizedError("Cannot close another employee's session");
        }

        if (session.status === "CLOSED") {
            throw new BadRequestError("Session is already closed");
        }

        await this.sessionRepository.updateStatus(sessionId, "CLOSED", shiftData);
        await this.sessionRepository.logAudit(sessionId, "CLOSE", shiftData);

        return { success: true };
    }
}
