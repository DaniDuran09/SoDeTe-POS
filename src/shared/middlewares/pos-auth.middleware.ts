import type { Request, Response, NextFunction } from "express";
import type { TokenAdapter } from "../security/interfaces/token.adapter.js";
import { UnauthorizedError } from "../errors/http-errors.js";

export class PosAuthMiddleware {
    constructor(private readonly tokenAdapter: TokenAdapter) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new UnauthorizedError("Missing or invalid token");
            }

            const token = authHeader.split(" ")[1];
            
            // Expected payload from pos-login
            // { sub: userId, employeeId, companyId, branchId, deviceId, sessionId, role }
            const payload = await this.tokenAdapter.verify<any>(token);

            if (!payload.sessionId || !payload.deviceId || !payload.employeeId) {
                throw new UnauthorizedError("Invalid POS token");
            }

            // Provide context for controllers
            (req as any).user = payload;
            
            // To ensure strictness, in a real implementation we might also query the DB
            // here to ensure the EmployeeSession is STILL 'ACTIVE'. For performance,
            // we rely on short-lived JWTs and/or Redis caches. For now, the structure enforces the context.

            next();
        } catch (error) {
            next(error);
        }
    };
}
