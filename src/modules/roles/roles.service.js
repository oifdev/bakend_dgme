const { supabaseAdmin } = require('../../config/supabase');

class RolesService {
    async getAll() {
        const { data, error } = await supabaseAdmin
            .from('roles')
            .select('*, role_permissions(permissions(id, code, module, action, scope_type))')
            .is('deleted_at', null)
            .order('name');

        if (error) throw error;
        return data;
    }

    async getById(id) {
        const { data, error } = await supabaseAdmin
            .from('roles')
            .select('*, role_permissions(permissions(id, code, module, action, scope_type))')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) throw { statusCode: 404, message: 'Rol no encontrado' };
        return data;
    }

    async create({ name, description, permission_ids }) {
        const { data: role, error } = await supabaseAdmin
            .from('roles')
            .insert({ name, description })
            .select()
            .single();

        if (error) throw error;

        if (permission_ids?.length > 0) {
            const assignments = permission_ids.map((pid) => ({
                role_id: role.id,
                permission_id: pid,
            }));
            await supabaseAdmin.from('role_permissions').insert(assignments);
        }

        return this.getById(role.id);
    }

    async update(id, { name, description, permission_ids }) {
        const updates = {};
        if (name) updates.name = name;
        if (description !== undefined) updates.description = description;
        updates.updated_at = new Date().toISOString();

        const { error } = await supabaseAdmin
            .from('roles')
            .update(updates)
            .eq('id', id)
            .is('deleted_at', null);

        if (error) throw error;

        if (permission_ids !== undefined) {
            await supabaseAdmin.from('role_permissions').delete().eq('role_id', id);
            if (permission_ids.length > 0) {
                const assignments = permission_ids.map((pid) => ({
                    role_id: id,
                    permission_id: pid,
                }));
                await supabaseAdmin.from('role_permissions').insert(assignments);
            }
        }

        return this.getById(id);
    }

    async delete(id) {
        const { error } = await supabaseAdmin
            .from('roles')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        return { message: 'Rol eliminado correctamente' };
    }
}

module.exports = new RolesService();
