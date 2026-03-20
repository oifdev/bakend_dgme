const { supabase, supabaseAdmin } = require('../../config/supabase');

class AuthService {
    /**
     * Sign in with email and password via Supabase Auth
     */
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw { statusCode: 401, message: 'Credenciales inválidas' };
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email,
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
            },
        };
    }

    /**
     * Refresh an existing session
     */
    async refreshToken(refreshToken) {
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error) {
            throw { statusCode: 401, message: 'No se pudo renovar la sesión' };
        }

        return {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
        };
    }

    /**
     * Sign out
     */
    async logout(token) {
        await supabaseAdmin.auth.admin.signOut(token);
    }

    /**
     * Get current user profile with roles and permissions
     */
    async getProfile(userId) {
        const { data: profile, error } = await supabaseAdmin
            .from('employee_profiles')
            .select(`
        *,
        subdirections (id, name),
        units (id, name),
        positions (id, name)
      `)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

        if (error || !profile) {
            return null;
        }

        const { data: userRoles } = await supabaseAdmin
            .from('user_roles')
            .select(`
        roles (
          id,
          name,
          role_permissions (
            permissions (id, code, module, action, scope_type)
          )
        )
      `)
            .eq('user_id', userId);

        const roles = [];
        const permissions = [];

        if (userRoles) {
            for (const ur of userRoles) {
                if (ur.roles) {
                    roles.push({ id: ur.roles.id, name: ur.roles.name });
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

        return { profile, roles, permissions };
    }
}

module.exports = new AuthService();
