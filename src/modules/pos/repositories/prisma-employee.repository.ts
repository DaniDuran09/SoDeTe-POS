import type { PrismaClient, Employee } from "@prisma/client";
import type { EmployeeRepository } from "./employee.repository.js";

export class PrismaEmployeeRepository implements EmployeeRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findByBranchId(branchId: string): Promise<Employee[]> {
        return this.prisma.employee.findMany({
            where: {
                branchAccess: {
                    some: { branchId }
                }
            },
            include: { user: true }
        });
    }

    async findById(id: string): Promise<Employee | null> {
        return this.prisma.employee.findUnique({
            where: { id },
            include: { user: true }
        });
    }

    async verifyAccessToBranch(employeeId: string, branchId: string): Promise<{ permissions: string[] } | null> {
        const access = await this.prisma.employeeBranchAccess.findUnique({
            where: {
                employeeId_branchId: { employeeId, branchId }
            }
        });
        
        return access ? { permissions: access.permissions } : null;
    }
}
