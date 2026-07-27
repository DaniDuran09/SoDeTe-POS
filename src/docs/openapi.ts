import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extend Zod to support .openapi() methods
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Register generic security scheme (Bearer Auth)
registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
});

// Example: Register the Auth global login route
// This assumes you have a loginRequestSchema in your Auth module
// For this example we define it inline, but you should import it.
const LoginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string()
}).openapi('LoginRequest');

const LoginResponseSchema = z.object({
    accessToken: z.string()
}).openapi('LoginResponse');

registry.registerPath({
    method: 'post',
    path: '/auth/login',
    description: 'Global Admin Login',
    summary: 'Authenticate a global admin/owner user',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginRequestSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Success',
            content: {
                'application/json': {
                    schema: LoginResponseSchema
                }
            }
        },
        401: {
            description: 'Invalid credentials'
        }
    }
});

// Generate the final OpenAPI document
export const generateOpenApiDocument = () => {
    const generator = new OpenApiGeneratorV3(registry.definitions);
    
    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Origen POS API',
            description: 'API documentation for Origen POS Multi-Tenant System',
        },
        servers: [{ url: 'http://localhost:3000' }]
    });
};
