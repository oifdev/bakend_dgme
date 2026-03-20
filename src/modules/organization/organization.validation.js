const { z } = require('zod');

const subdirectionSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    code: z.string().min(1, 'Código requerido'),
    chief_user_id: z.string().uuid().nullable().optional(),
});

const unitSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    code: z.string().min(1, 'Código requerido'),
    subdirection_id: z.string().uuid('Subdirección requerida'),
    chief_user_id: z.string().uuid().nullable().optional(),
});

const positionSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    level: z.number().int().min(1).optional(),
});

module.exports = { subdirectionSchema, unitSchema, positionSchema };
