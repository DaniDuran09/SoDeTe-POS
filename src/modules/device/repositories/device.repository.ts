import type { Device } from "@prisma/client";

export interface DeviceRepository {
    findByDeviceToken(token: string): Promise<Device | null>;
    findById(id: string): Promise<Device | null>;
    createConfigured(companyId: string, branchId: string, name: string, token: string): Promise<Device>;
    update(id: string, data: Partial<Device>): Promise<Device>;
}

