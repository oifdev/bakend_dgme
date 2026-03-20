/**
 * Generic Zod validation middleware.
 *
 * Usage:
 *   router.post('/', validate(createUserSchema), controller.create)
 */
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));

            return res.status(400).json({
                error: 'Error de validación',
                details: errors,
            });
        }

        req.validatedBody = result.data;
        next();
    };
};

module.exports = validate;
