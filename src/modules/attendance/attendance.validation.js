const { z } = require('zod');

const leaveRequestSchema = z.object({
    type: z.enum(['vacaciones', 'personal', 'medico']),
    start_date: z.string().min(1, 'Fecha de inicio requerida'),
    end_date: z.string().min(1, 'Fecha de fin requerida'),
    reason: z.string().optional(),
});

module.exports = { leaveRequestSchema };
