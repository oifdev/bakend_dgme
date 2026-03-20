const { supabaseAdmin } = require('../../config/supabase');

class AuditService {
    async getLogs({ page = 1, limit = 30, user_id, action, entity_type, start_date, end_date }) {
        let query = supabaseAdmin
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (user_id) query = query.eq('user_id', user_id);
        if (action) query = query.eq('action', action);
        if (entity_type) query = query.eq('entity_type', entity_type);
        if (start_date) query = query.gte('created_at', start_date);
        if (end_date) query = query.lte('created_at', end_date);

        const from = (page - 1) * limit;
        query = query.range(from, from + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, total: count, page, limit };
    }

    async getLogById(id) {
        const { data, error } = await supabaseAdmin
            .from('audit_logs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw { statusCode: 404, message: 'Registro no encontrado' };
        return data;
    }
}

module.exports = new AuditService();
