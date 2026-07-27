import type { PrismaClient, Device } from "@prisma/client";
import type { DeviceRepository } from "./device.repository.js";

export class PrismaDeviceRepository implements DeviceRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findByDeviceToken(token: string): Promise<Device | null> {
        return this.prisma.device.findUnique({
            where: { deviceToken: token }
        });
    }

    async findById(id: string): Promise<Device | null> {
        return this.prisma.device.findUnique({
            where: { id }
        });
    }

    async createConfigured(companyId: string, branchId: string, name: string, token: string): Promise<Device> {
        return this.prisma.device.create({
            data: {
                companyId,
                branchId,
                name,
                deviceToken: token,
                isActive: true
            }
        });
    }

    async update(id: string, data: Partial<Device>): Promise<Device> {
        return this.prisma.device.update({
            where: { id },
            data
        });
    }
}
