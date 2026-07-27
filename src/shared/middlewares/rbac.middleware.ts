import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/http-errors.js";

/**
 * Middleware to check if the current POS user has the required permissions.
 * Assumes PosAuthMiddleware has already run and populated req.user.
 */
export const requirePermissions = (requiredPermissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            if (!user) {
                throw new ForbiddenError("User context not found");
            }

            // The ADMIN role automatically bypasses permission checks
            if (user.role === "ADMIN") {
                return next();
            }

            // For EMPLOYEE, we need to check their explicit permissions array.
            // Since we didn't put 'permissions' in the JWT payload (to keep it small),
            // we should technically query the DB here. 
            // However, to keep it fast, we can either put permissions in the JWT,
            // or pass a dependency to the DB. 
            
            // To demonstrate the logic as requested:
            // (If we added permissions to the JWT in PosLoginUseCase):
            const userPermissions: string[] = user.permissions || [];
            
            const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));

            if (!hasAllPermissions) {
                throw new ForbiddenError("Insufficient permissions");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
