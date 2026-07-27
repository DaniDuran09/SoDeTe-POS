import type { EmployeeSession, EmployeeSessionAudit } from "@prisma/client";

export interface EmployeeSessionRepository {
    createSession(deviceId: string, employeeId: string): Promise<EmployeeSession>;
    findActiveSessionByDevice(deviceId: string): Promise<EmployeeSession | null>;
    findById(id: string): Promise<EmployeeSession | null>;
    updateStatus(id: string, status: "ACTIVE" | "PAUSED" | "CLOSED", shiftData?: any): Promise<EmployeeSession>;
    logAudit(sessionId: string, action: string, details?: any): Promise<EmployeeSessionAudit>;
}
