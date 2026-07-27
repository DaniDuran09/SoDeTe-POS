import type { PrismaClient, EmployeeSession, EmployeeSessionAudit } from "@prisma/client";
import type { EmployeeSessionRepository } from "./employee-session.repository.js";

export class PrismaEmployeeSessionRepository implements EmployeeSessionRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async createSession(deviceId: string, employeeId: string): Promise<EmployeeSession> {
        return this.prisma.employeeSession.create({
            data: {
                deviceId,
                employeeId,
                status: "ACTIVE"
            }
        });
    }

    async findActiveSessionByDevice(deviceId: string): Promise<EmployeeSession | null> {
        return this.prisma.employeeSession.findFirst({
            where: {
                deviceId,
                status: "ACTIVE"
            }
        });
    }

    async findById(id: string): Promise<EmployeeSession | null> {
        return this.prisma.employeeSession.findUnique({
            where: { id }
        });
    }

    async updateStatus(id: string, status: "ACTIVE" | "PAUSED" | "CLOSED", shiftData?: any): Promise<EmployeeSession> {
        const updateData: any = { status };
        if (status === "CLOSED") {
            updateData.endedAt = new Date();
        }
        if (shiftData) {
            updateData.shiftData = shiftData;
        }

        return this.prisma.employeeSession.update({
            where: { id },
            data: updateData
        });
    }

    async logAudit(sessionId: string, action: string, details?: any): Promise<EmployeeSessionAudit> {
        return this.prisma.employeeSessionAudit.create({
            data: {
                sessionId,
                action,
                details: details || {}
            }
        });
    }
}
