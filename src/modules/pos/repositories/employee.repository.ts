import type { Employee } from "@prisma/client";

export interface EmployeeRepository {
    findByBranchId(branchId: string): Promise<Employee[]>;
    findById(id: string): Promise<Employee | null>;
    verifyAccessToBranch(employeeId: string, branchId: string): Promise<{ permissions: string[] } | null>;
}
