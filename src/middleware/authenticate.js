const { supabaseAdmin } = require('../config/supabase');

/**
 * Authentication middleware — verifies JWT from Authorization header
 * using Supabase Auth. Attaches user data to req.user.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de autenticación requerido' });
        }

        const token = authHeader.split(' ')[1];

        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Token inválido o expirado' });
        }

        // Fetch user roles and permissions
        const { data: userRoles } = await supabaseAdmin
            .from('user_roles')
            .select(`
        role_id,
        roles (
          id,
          name,
          role_permissions (
            permissions (
              id,
              code,
              module,
              action,
              scope_type
            )
          )
        )
      `)
            .eq('user_id', user.id);

        // Fetch employee profile for scope-based checks
        const { data: profile } = await supabaseAdmin
            .from('employee_profiles')
            .select('id, subdirection_id, unit_id, position_id')
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .single();

        // Flatten permissions
        const permissions = [];
        const roleNames = [];
        if (userRoles) {
            for (const ur of userRoles) {
                if (ur.roles) {
                    roleNames.push(ur.roles.name);
                    if (ur.roles.role_permissions) {
                        for (const rp of ur.roles.role_permissions) {
                            if (rp.permissions) {
                                permissions.push(rp.permissions);
                            }
                        }
                    }
                }
            }
        }

        req.user = {
            id: user.id,
            email: user.email,
            roles: roleNames,
            permissions,
            profile: profile || null,
        };

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ error: 'Error de autenticación interno' });
    }
};

module.exports = authenticate;
