const { supabaseAdmin } = require('../../config/supabase');

class OrganizationService {
    // --- Subdirections ---
    async getAllSubdirections() {
        const { data, error } = await supabaseAdmin
            .from('subdirections')
            .select('*, chief:employee_profiles!subdirections_chief_user_id_fkey(id, first_name, last_name)')
            .is('deleted_at', null)
            .order('name');
        if (error) throw error;
        return data;
    }

    async getSubdirectionById(id) {
        const { data, error } = await supabaseAdmin
            .from('subdirections')
            .select('*, chief:employee_profiles!subdirections_chief_user_id_fkey(id, first_name, last_name)')
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (error) throw { statusCode: 404, message: 'Subdirección no encontrada' };
        return data;
    }

    async createSubdirection({ name, code, chief_user_id }) {
        const { data, error } = await supabaseAdmin
            .from('subdirections')
            .insert({ name, code, chief_user_id: chief_user_id || null })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateSubdirection(id, updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('subdirections')
            .update(updates)
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteSubdirection(id) {
        const { error } = await supabaseAdmin
            .from('subdirections')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        return { message: 'Subdirección eliminada' };
    }

    // --- Units ---
    async getAllUnits(subdirection_id) {
        let query = supabaseAdmin
            .from('units')
            .select('*, subdirections(id, name), chief:employee_profiles!units_chief_user_id_fkey(id, first_name, last_name)')
            .is('deleted_at', null)
            .order('name');

        if (subdirection_id) query = query.eq('subdirection_id', subdirection_id);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getUnitById(id) {
        const { data, error } = await supabaseAdmin
            .from('units')
            .select('*, subdirections(id, name), chief:employee_profiles!units_chief_user_id_fkey(id, first_name, last_name)')
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (error) throw { statusCode: 404, message: 'Unidad no encontrada' };
        return data;
    }

    async createUnit({ name, code, subdirection_id, chief_user_id }) {
        const { data, error } = await supabaseAdmin
            .from('units')
            .insert({ name, code, subdirection_id, chief_user_id: chief_user_id || null })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateUnit(id, updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('units')
            .update(updates)
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteUnit(id) {
        const { error } = await supabaseAdmin
            .from('units')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        return { message: 'Unidad eliminada' };
    }

    // --- Positions ---
    async getAllPositions() {
        const { data, error } = await supabaseAdmin
            .from('positions')
            .select('*')
            .is('deleted_at', null)
            .order('name');
        if (error) throw error;
        return data;
    }

    async createPosition({ name, level }) {
        const { data, error } = await supabaseAdmin
            .from('positions')
            .insert({ name, level })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updatePosition(id, updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('positions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deletePosition(id) {
        const { error } = await supabaseAdmin
            .from('positions')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        return { message: 'Posición eliminada' };
    }

    // --- Org Chart ---
    async getOrgChart() {
        const { data, error } = await supabaseAdmin
            .from('organizational_structure')
            .select('*')
            .order('level');
        if (error) throw error;
        return data;
    }

    async getOrgTree() {
        // Build a tree from subdirections → units with employee counts
        const subdirections = await this.getAllSubdirections();
        const units = await this.getAllUnits();

        const { data: empCounts } = await supabaseAdmin
            .from('employee_profiles')
            .select('subdirection_id, unit_id')
            .is('deleted_at', null)
            .eq('employment_status', 'activo');

        const tree = subdirections.map((sub) => {
            const subUnits = units.filter((u) => u.subdirection_id === sub.id);
            const subEmployees = empCounts?.filter((e) => e.subdirection_id === sub.id) || [];

            return {
                ...sub,
                type: 'subdirection',
                employee_count: subEmployees.length,
                children: subUnits.map((unit) => {
                    const unitEmployees = empCounts?.filter((e) => e.unit_id === unit.id) || [];
                    return {
                        ...unit,
                        type: 'unit',
                        employee_count: unitEmployees.length,
                    };
                }),
            };
        });

        return tree;
    }
}

module.exports = new OrganizationService();
