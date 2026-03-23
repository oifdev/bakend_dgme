const { supabaseAdmin } = require('../../config/supabase');
const usersRepository = require('./users.repository');

class UsersService {
    /**
     * Create user via Supabase Auth Admin API + employee profile
     */
    async createUser(userData) {
        // 1. Create auth user in Supabase
        const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true, // auto-confirm since admin creates users
            });

        if (authError) {
            throw { statusCode: 400, message: authError.message };
        }

        let profile;
        try {
            // 2. Create employee profile
            profile = await usersRepository.create({
                user_id: authData.user.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                identity_number: userData.identity_number,
                birth_date: userData.birth_date || null,
                address: userData.address || null,
                phone: userData.phone || null,
                institutional_email: userData.institutional_email || userData.email,
                contract_type: userData.contract_type || null,
                start_date: userData.start_date || null,
                subdirection_id: userData.subdirection_id || null,
                unit_id: userData.unit_id || null,
                position_id: userData.position_id || null,
            });

            // 3. Assign roles if provided
            if (userData.role_ids && userData.role_ids.length > 0) {
                const roleAssignments = userData.role_ids.map((role_id) => ({
                    user_id: authData.user.id,
                    role_id,
                }));
                await supabaseAdmin.from('user_roles').insert(roleAssignments);
            }
        } catch (profileError) {
            // Rollback: eliminar el usuario de Supabase Auth para evitar usuarios huérfanos
            try {
                await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            } catch (rollbackError) {
                console.error(
                    `[UsersService] Rollback fallido para auth user ${authData.user.id}:`,
                    rollbackError
                );
            }
            throw {
                statusCode: 500,
                message: 'Error al crear el perfil del usuario. La operación fue revertida.',
            };
        }

        return profile;
    }

    async getAllUsers(filters) {
        return usersRepository.findAll(filters);
    }

    async getUserById(id) {
        const profile = await usersRepository.findById(id);
        if (!profile) {
            throw { statusCode: 404, message: 'Usuario no encontrado' };
        }

        // Get roles
        const { data: roles } = await supabaseAdmin
            .from('user_roles')
            .select('roles (id, name)')
            .eq('user_id', profile.user_id);

        return { ...profile, roles: roles?.map((r) => r.roles) || [] };
    }

    async updateUser(id, updateData) {
        const existing = await usersRepository.findById(id);
        if (!existing) {
            throw { statusCode: 404, message: 'Usuario no encontrado' };
        }

        // Track changes for employment history
        const fieldsToTrack = ['position_id', 'subdirection_id', 'unit_id', 'contract_type', 'employment_status'];
        const changes = [];

        for (const field of fieldsToTrack) {
            if (updateData[field] !== undefined && updateData[field] !== existing[field]) {
                changes.push({
                    employee_id: id,
                    field_changed: field,
                    old_value: String(existing[field] || ''),
                    new_value: String(updateData[field] || ''),
                    changed_by: updateData._changed_by || null,
                });
            }
        }

        if (changes.length > 0) {
            await supabaseAdmin.from('employment_history').insert(changes);
        }

        // Update roles if provided
        if (updateData.role_ids) {
            await supabaseAdmin.from('user_roles').delete().eq('user_id', existing.user_id);
            if (updateData.role_ids.length > 0) {
                const roleAssignments = updateData.role_ids.map((role_id) => ({
                    user_id: existing.user_id,
                    role_id,
                }));
                await supabaseAdmin.from('user_roles').insert(roleAssignments);
            }
            delete updateData.role_ids;
        }

        delete updateData._changed_by;
        return usersRepository.update(id, updateData);
    }

    async deleteUser(id) {
        const existing = await usersRepository.findById(id);
        if (!existing) {
            throw { statusCode: 404, message: 'Usuario no encontrado' };
        }

        // Soft delete profile
        await usersRepository.softDelete(id);

        // Deshabilitar el usuario en Supabase Auth (ban efectivo ~100 años)
        await supabaseAdmin.auth.admin.updateUserById(existing.user_id, {
            ban_duration: '876000h',
            user_metadata: { disabled: true },
        });

        return { message: 'Usuario eliminado correctamente' };
    }

    async toggleUserStatus(id, active) {
        const existing = await usersRepository.findById(id);
        if (!existing) {
            throw { statusCode: 404, message: 'Usuario no encontrado' };
        }

        await usersRepository.update(id, {
            employment_status: active ? 'activo' : 'inactivo',
        });

        // Ban/unban in Supabase Auth
        if (!active) {
            await supabaseAdmin.auth.admin.updateUserById(existing.user_id, {
                ban_duration: '876000h', // ~100 years
            });
        } else {
            await supabaseAdmin.auth.admin.updateUserById(existing.user_id, {
                ban_duration: 'none',
            });
        }

        return { message: active ? 'Usuario activado' : 'Usuario desactivado' };
    }
}

module.exports = new UsersService();
