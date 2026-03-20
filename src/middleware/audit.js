const { supabaseAdmin } = require('../config/supabase');

/**
 * Audit middleware — automatically logs CUD (Create, Update, Delete)
 * operations to the audit_logs table.
 *
 * Usage: Place AFTER authenticate middleware.
 *   router.post('/', authenticate, audit('user', 'create'), controller.create)
 */
const audit = (entityType, action) => {
    return async (req, res, next) => {
        // Store original json method to intercept response
        const originalJson = res.json.bind(res);

        res.json = async function (data) {
            // Only log successful mutations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    await supabaseAdmin.from('audit_logs').insert({
                        user_id: req.user?.id || null,
                        action,
                        entity_type: entityType,
                        entity_id: data?.data?.id || data?.id || null,
                        old_data: req.auditOldData || null,
                        new_data: req.body || null,
                        ip_address:
                            req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
                    });
                } catch (auditError) {
                    console.error('Audit log error:', auditError);
                    // Don't fail the request if audit logging fails
                }
            }

            return originalJson(data);
        };

        next();
    };
};

module.exports = audit;
