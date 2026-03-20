const { supabaseAdmin } = require('../../config/supabase');

class AttendanceService {
    // --- Clock In/Out ---
    async checkIn(employeeId) {
        const today = new Date().toISOString().split('T')[0];

        // Check if already checked in today
        const { data: existing } = await supabaseAdmin
            .from('attendance_logs')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('date', today)
            .is('check_out', null)
            .single();

        if (existing) {
            throw { statusCode: 400, message: 'Ya tiene una entrada registrada sin salida' };
        }

        const { data, error } = await supabaseAdmin
            .from('attendance_logs')
            .insert({
                employee_id: employeeId,
                check_in: new Date().toISOString(),
                date: today,
                type: 'regular',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async checkOut(employeeId) {
        const today = new Date().toISOString().split('T')[0];

        const { data: existing } = await supabaseAdmin
            .from('attendance_logs')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('date', today)
            .is('check_out', null)
            .single();

        if (!existing) {
            throw { statusCode: 400, message: 'No hay entrada registrada para hoy' };
        }

        const { data, error } = await supabaseAdmin
            .from('attendance_logs')
            .update({ check_out: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAttendanceLogs({ employee_id, start_date, end_date, page = 1, limit = 30 }) {
        let query = supabaseAdmin
            .from('attendance_logs')
            .select('*, employee_profiles(first_name, last_name)', { count: 'exact' })
            .order('date', { ascending: false });

        if (employee_id) query = query.eq('employee_id', employee_id);
        if (start_date) query = query.gte('date', start_date);
        if (end_date) query = query.lte('date', end_date);

        const from = (page - 1) * limit;
        query = query.range(from, from + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, total: count, page, limit };
    }

    async getTodayStatus(employeeId) {
        const today = new Date().toISOString().split('T')[0];

        const { data } = await supabaseAdmin
            .from('attendance_logs')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('date', today)
            .order('check_in', { ascending: false })
            .limit(1)
            .single();

        return data || { status: 'not_checked_in' };
    }

    // --- Leave Requests ---
    async createLeaveRequest({ employee_id, type, start_date, end_date, reason }) {
        const { data, error } = await supabaseAdmin
            .from('leave_requests')
            .insert({
                employee_id,
                type,
                start_date,
                end_date,
                reason: reason || null,
                status: 'pendiente',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getLeaveRequests({ employee_id, status: reqStatus, page = 1, limit = 20 }) {
        let query = supabaseAdmin
            .from('leave_requests')
            .select('*, employee_profiles(first_name, last_name)', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (employee_id) query = query.eq('employee_id', employee_id);
        if (reqStatus) query = query.eq('status', reqStatus);

        const from = (page - 1) * limit;
        query = query.range(from, from + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, total: count, page, limit };
    }

    async approveLeaveRequest(id, approvedBy) {
        const { data, error } = await supabaseAdmin
            .from('leave_requests')
            .update({ status: 'aprobado', approved_by: approvedBy, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async rejectLeaveRequest(id, approvedBy) {
        const { data, error } = await supabaseAdmin
            .from('leave_requests')
            .update({ status: 'rechazado', approved_by: approvedBy, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // --- Absences ---
    async getTodayAbsences() {
        const today = new Date().toISOString().split('T')[0];

        // Get active employees
        const { data: employees } = await supabaseAdmin
            .from('employee_profiles')
            .select('id, first_name, last_name, subdirection_id, unit_id')
            .is('deleted_at', null)
            .eq('employment_status', 'activo');

        // Get today's attendance
        const { data: attendance } = await supabaseAdmin
            .from('attendance_logs')
            .select('employee_id')
            .eq('date', today);

        const presentIds = new Set((attendance || []).map((a) => a.employee_id));

        // Get today's approved leaves
        const { data: leaves } = await supabaseAdmin
            .from('leave_requests')
            .select('employee_id')
            .eq('status', 'aprobado')
            .lte('start_date', today)
            .gte('end_date', today);

        const onLeaveIds = new Set((leaves || []).map((l) => l.employee_id));

        const absences = (employees || [])
            .filter((e) => !presentIds.has(e.id) && !onLeaveIds.has(e.id))
            .map((e) => ({
                ...e,
                absence_type: 'no_registro',
            }));

        return absences;
    }

    // --- Vacation Balance ---
    async getVacationBalance(employeeId) {
        const { data: profile } = await supabaseAdmin
            .from('employee_profiles')
            .select('start_date')
            .eq('id', employeeId)
            .single();

        if (!profile) throw { statusCode: 404, message: 'Empleado no encontrado' };

        // Calculate years of service
        const startDate = new Date(profile.start_date);
        const now = new Date();
        const yearsOfService = Math.floor((now - startDate) / (365.25 * 24 * 60 * 60 * 1000));

        // Base vacation days (typically 10-20 days depending on years)
        const baseDays = Math.min(10 + yearsOfService * 2, 30);

        // Count used vacation days this year
        const yearStart = `${now.getFullYear()}-01-01`;
        const yearEnd = `${now.getFullYear()}-12-31`;

        const { data: usedLeaves } = await supabaseAdmin
            .from('leave_requests')
            .select('start_date, end_date')
            .eq('employee_id', employeeId)
            .eq('type', 'vacaciones')
            .eq('status', 'aprobado')
            .gte('start_date', yearStart)
            .lte('end_date', yearEnd);

        let usedDays = 0;
        for (const leave of usedLeaves || []) {
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            usedDays += Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1;
        }

        return {
            total_days: baseDays,
            used_days: usedDays,
            remaining_days: baseDays - usedDays,
            years_of_service: yearsOfService,
        };
    }
}

module.exports = new AttendanceService();
