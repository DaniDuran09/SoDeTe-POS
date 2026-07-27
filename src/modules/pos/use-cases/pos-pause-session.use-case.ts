import type { EmployeeSessionRepository } from "../repositories/employee-session.repository.js";
import { UnauthorizedError, NotFoundError } from "../../../shared/errors/http-errors.js";

export class PosPauseSessionUseCase {
    constructor(private readonly sessionRepository: EmployeeSessionRepository) {}

    async execute(sessionId: string, employeeId: string) {
        const session = await this.sessionRepository.findById(sessionId);

        if (!session) {
            throw new NotFoundError("Session not found");
        }

        if (session.employeeId !== employeeId) {
            throw new UnauthorizedError("Cannot pause another employee's session");
        }

        if (session.status !== "ACTIVE") {
            throw new UnauthorizedError("Session is not active");
        }

        await this.sessionRepository.updateStatus(sessionId, "PAUSED");
        await this.sessionRepository.logAudit(sessionId, "PAUSE");

        return { success: true };
    }
}
