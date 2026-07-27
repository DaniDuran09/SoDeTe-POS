import { z } from "zod";

export const deviceLoginRequestSchema = z.object({
    deviceToken: z.string().min(1),
});

export type DeviceLoginRequestDto = z.infer<typeof deviceLoginRequestSchema>;
