const { supabaseAdmin } = require('../../config/supabase');

class DashboardService {
    async getStats() {
        // Total employees
        const { count: totalEmployees } = await supabaseAdmin
            .from('employee_profiles')
            .select('*', { count: 'exact', head: true })
            .is('deleted_at', null)
            .eq('employment_status', 'activo');

        // By subdirection
        const { data: bySubdirection } = await supabaseAdmin
            .from('employee_profiles')
            .select('subdirection_id, subdirections(name)')
            .is('deleted_at', null)
            .eq('employment_status', 'activo');

        const subdirectionCounts = {};
        for (const emp of bySubdirection || []) {
            const name = emp.subdirections?.name || 'Sin asignar';
            subdirectionCounts[name] = (subdirectionCounts[name] || 0) + 1;
        }

        // By unit
        const { data: byUnit } = await supabaseAdmin
            .from('employee_profiles')
            .select('unit_id, units(name)')
            .is('deleted_at', null)
            .eq('employment_status', 'activo');

        const unitCounts = {};
        for (const emp of byUnit || []) {
            const name = emp.units?.name || 'Sin asignar';
            unitCounts[name] = (unitCounts[name] || 0) + 1;
        }

        // Active vacations
        const today = new Date().toISOString().split('T')[0];
        const { count: activeVacations } = await supabaseAdmin
            .from('leave_requests')
            .select('*', { count: 'exact', head: true })
            .eq('type', 'vacaciones')
            .eq('status', 'aprobado')
            .lte('start_date', today)
            .gte('end_date', today);

        // Today's absences count
        const { data: todayAttendance } = await supabaseAdmin
            .from('attendance_logs')
            .select('employee_id')
            .eq('date', today);

        const presentCount = new Set((todayAttendance || []).map((a) => a.employee_id)).size;
        const absencesCount = (totalEmployees || 0) - presentCount;

        // Pending leave requests
        const { count: pendingLeaves } = await supabaseAdmin
            .from('leave_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pendiente');

        return {
            total_employees: totalEmployees || 0,
            employees_by_subdirection: subdirectionCounts,
            employees_by_unit: unitCounts,
            active_vacations: activeVacations || 0,
            today_absences: absencesCount > 0 ? absencesCount : 0,
            present_today: presentCount,
            pending_leave_requests: pendingLeaves || 0,
        };
    }
}

module.exports = new DashboardService();
