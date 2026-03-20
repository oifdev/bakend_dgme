const { z } = require('zod');

const createRoleSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    description: z.string().optional(),
    permission_ids: z.array(z.string().uuid()).optional(),
});

const updateRoleSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    permission_ids: z.array(z.string().uuid()).optional(),
});

module.exports = { createRoleSchema, updateRoleSchema };
