const { z } = require('zod');

const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    first_name: z.string().min(1, 'Nombres requeridos'),
    last_name: z.string().min(1, 'Apellidos requeridos'),
    identity_number: z.string().min(1, 'Número de identidad requerido'),
    birth_date: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    institutional_email: z.string().email().optional(),
    contract_type: z.enum(['contrato', 'acuerdo', 'permanente']).optional(),
    start_date: z.string().optional(),
    subdirection_id: z.string().uuid().optional(),
    unit_id: z.string().uuid().optional(),
    position_id: z.string().uuid().optional(),
    role_ids: z.array(z.string().uuid()).optional(),
});

const updateUserSchema = z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    identity_number: z.string().min(1).optional(),
    birth_date: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    institutional_email: z.string().email().optional(),
    contract_type: z.enum(['contrato', 'acuerdo', 'permanente']).optional(),
    start_date: z.string().optional(),
    employment_status: z.enum(['activo', 'inactivo', 'suspendido']).optional(),
    subdirection_id: z.string().uuid().nullable().optional(),
    unit_id: z.string().uuid().nullable().optional(),
    position_id: z.string().uuid().nullable().optional(),
    role_ids: z.array(z.string().uuid()).optional(),
});

module.exports = { createUserSchema, updateUserSchema };
