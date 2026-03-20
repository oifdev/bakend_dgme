const { supabaseAdmin } = require('../../config/supabase');

class PermissionsService {
    async getAll({ module: mod } = {}) {
        let query = supabaseAdmin
            .from('permissions')
            .select('*')
            .order('module')
            .order('action');

        if (mod) {
            query = query.eq('module', mod);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getById(id) {
        const { data, error } = await supabaseAdmin
            .from('permissions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw { statusCode: 404, message: 'Permiso no encontrado' };
        return data;
    }

    async create({ code, description, module, action, scope_type }) {
        const { data, error } = await supabaseAdmin
            .from('permissions')
            .insert({ code, description, module, action, scope_type: scope_type || 'global' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id, updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('permissions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id) {
        // Remove from role_permissions first
        await supabaseAdmin.from('role_permissions').delete().eq('permission_id', id);
        const { error } = await supabaseAdmin.from('permissions').delete().eq('id', id);
        if (error) throw error;
        return { message: 'Permiso eliminado correctamente' };
    }

    async getGroupedByModule() {
        const { data, error } = await supabaseAdmin
            .from('permissions')
            .select('*')
            .order('module')
            .order('action');

        if (error) throw error;

        const grouped = {};
        for (const perm of data) {
            if (!grouped[perm.module]) grouped[perm.module] = [];
            grouped[perm.module].push(perm);
        }
        return grouped;
    }
}

module.exports = new PermissionsService();
