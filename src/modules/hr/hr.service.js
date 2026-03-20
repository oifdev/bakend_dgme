const { supabaseAdmin } = require('../../config/supabase');

class HRService {
    // --- Employee Profiles ---
    async getEmployees({ page = 1, limit = 20, search, subdirection_id, unit_id, status }) {
        let query = supabaseAdmin
            .from('employee_profiles')
            .select(`
        *,
        subdirections(id, name),
        units(id, name),
        positions(id, name)
      `, { count: 'exact' })
            .is('deleted_at', null)
            .order('last_name');

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,identity_number.ilike.%${search}%`);
        }
        if (subdirection_id) query = query.eq('subdirection_id', subdirection_id);
        if (unit_id) query = query.eq('unit_id', unit_id);
        if (status) query = query.eq('employment_status', status);

        const from = (page - 1) * limit;
        query = query.range(from, from + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, total: count, page, limit };
    }

    async getEmployeeById(id) {
        const { data, error } = await supabaseAdmin
            .from('employee_profiles')
            .select(`
        *,
        subdirections(id, name),
        units(id, name),
        positions(id, name)
      `)
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) throw { statusCode: 404, message: 'Empleado no encontrado' };
        return data;
    }

    async updateEmployee(id, updates, changedBy) {
        const existing = await this.getEmployeeById(id);

        // Track salary changes
        if (updates.salary !== undefined && updates.salary !== existing.salary) {
            await supabaseAdmin.from('salary_history').insert({
                employee_id: id,
                old_salary: existing.salary || 0,
                new_salary: updates.salary,
                effective_date: new Date().toISOString().split('T')[0],
                changed_by: changedBy,
            });
        }

        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('employee_profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // User can only update limited personal fields
    async updatePersonalInfo(userId, updates) {
        const allowedFields = ['address', 'phone'];
        const filtered = {};
        for (const key of allowedFields) {
            if (updates[key] !== undefined) filtered[key] = updates[key];
        }

        if (Object.keys(filtered).length === 0) {
            throw { statusCode: 400, message: 'No hay campos permitidos para actualizar' };
        }

        filtered.updated_at = new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from('employee_profiles')
            .update(filtered)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // --- Employment History ---
    async getEmploymentHistory(employeeId) {
        const { data, error } = await supabaseAdmin
            .from('employment_history')
            .select('*')
            .eq('employee_id', employeeId)
            .order('changed_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    // --- Salary History ---
    async getSalaryHistory(employeeId) {
        const { data, error } = await supabaseAdmin
            .from('salary_history')
            .select('*')
            .eq('employee_id', employeeId)
            .order('effective_date', { ascending: false });

        if (error) throw error;
        return data;
    }

    // --- Documents ---
    async getDocuments(employeeId) {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .select('*')
            .eq('employee_id', employeeId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async uploadDocument({ employeeId, name, fileBuffer, mimeType, uploadedBy }) {
        const fileName = `employees/${employeeId}/docs/${Date.now()}_${name}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('documents')
            .upload(fileName, fileBuffer, { contentType: mimeType });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseAdmin.storage
            .from('documents')
            .getPublicUrl(fileName);

        const { data, error } = await supabaseAdmin
            .from('documents')
            .insert({
                employee_id: employeeId,
                name,
                file_url: urlData.publicUrl,
                file_type: mimeType,
                uploaded_by: uploadedBy,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteDocument(id) {
        const { error } = await supabaseAdmin
            .from('documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        return { message: 'Documento eliminado' };
    }

    // --- Photo Upload ---
    async uploadPhoto(employeeId, fileBuffer, mimeType) {
        const ext = mimeType.split('/')[1] || 'jpg';
        const fileName = `employees/${employeeId}/photo.${ext}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('photos')
            .upload(fileName, fileBuffer, { contentType: mimeType, upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseAdmin.storage
            .from('photos')
            .getPublicUrl(fileName);

        await supabaseAdmin
            .from('employee_profiles')
            .update({ photo_url: urlData.publicUrl, updated_at: new Date().toISOString() })
            .eq('id', employeeId);

        return { photo_url: urlData.publicUrl };
    }
}

module.exports = new HRService();
