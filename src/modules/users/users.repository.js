const { supabaseAdmin } = require('../../config/supabase');

class UsersRepository {
    async findAll({ page = 1, limit = 20, search, subdirection_id, unit_id, status }) {
        let query = supabaseAdmin
            .from('employee_profiles')
            .select(`
        *,
        subdirections (id, name),
        units (id, name),
        positions (id, name)
      `, { count: 'exact' })
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,identity_number.ilike.%${search}%`);
        }
        if (subdirection_id) {
            query = query.eq('subdirection_id', subdirection_id);
        }
        if (unit_id) {
            query = query.eq('unit_id', unit_id);
        }
        if (status) {
            query = query.eq('employment_status', status);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;

        return { data, total: count, page, limit };
    }

    async findById(id) {
        const { data, error } = await supabaseAdmin
            .from('employee_profiles')
            .select(`
        *,
        subdirections (id, name),
        units (id, name),
        positions (id, name)
      `)
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) return null;
        return data;
    }

    async findByUserId(userId) {
        const { data, error } = await supabaseAdmin
            .from('employee_profiles')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

        if (error) return null;
        return data;
    }

    async create(profileData) {
        const { data, error } = await supabaseAdmin
            .from('employee_profiles')
            .insert(profileData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id, profileData) {
        const { data, error } = await supabaseAdmin
            .from('employee_profiles')
            .update({ ...profileData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async softDelete(id) {
        const { data, error } = await supabaseAdmin
            .from('employee_profiles')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findByScope(scope) {
        let query = supabaseAdmin
            .from('employee_profiles')
            .select('*')
            .is('deleted_at', null);

        if (scope.type === 'subdirection') {
            query = query.eq('subdirection_id', scope.subdirection_id);
        } else if (scope.type === 'unit') {
            query = query.eq('unit_id', scope.unit_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
}

module.exports = new UsersRepository();
