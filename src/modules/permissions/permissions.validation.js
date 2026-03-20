const { z } = require('zod');

const createPermissionSchema = z.object({
    code: z.string().min(1, 'Código requerido'),
    description: z.string().optional(),
    module: z.string().min(1, 'Módulo requerido'),
    action: z.enum(['create', 'read', 'update', 'delete', 'manage']),
    scope_type: z.enum(['global', 'unit', 'subdirection']).default('global'),
});

const updatePermissionSchema = z.object({
    code: z.string().min(1).optional(),
    description: z.string().optional(),
    module: z.string().min(1).optional(),
    action: z.enum(['create', 'read', 'update', 'delete', 'manage']).optional(),
    scope_type: z.enum(['global', 'unit', 'subdirection']).optional(),
});

module.exports = { createPermissionSchema, updatePermissionSchema };
