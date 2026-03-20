const attendanceService = require('./attendance.service');

class AttendanceController {
    async checkIn(req, res, next) {
        try {
            const data = await attendanceService.checkIn(req.user.profile?.id);
            res.status(201).json({ data });
        } catch (err) { next(err); }
    }

    async checkOut(req, res, next) {
        try {
            const data = await attendanceService.checkOut(req.user.profile?.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getLogs(req, res, next) {
        try {
            const filters = {
                employee_id: req.query.employee_id,
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 30,
            };
            const data = await attendanceService.getAttendanceLogs(filters);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getTodayStatus(req, res, next) {
        try {
            const data = await attendanceService.getTodayStatus(req.user.profile?.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async createLeave(req, res, next) {
        try {
            const data = await attendanceService.createLeaveRequest({
                employee_id: req.user.profile?.id,
                ...req.validatedBody,
            });
            res.status(201).json({ data });
        } catch (err) { next(err); }
    }

    async getLeaves(req, res, next) {
        try {
            const filters = {
                employee_id: req.query.employee_id,
                status: req.query.status,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
            };
            const data = await attendanceService.getLeaveRequests(filters);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async approveLeave(req, res, next) {
        try {
            const data = await attendanceService.approveLeaveRequest(req.params.id, req.user.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async rejectLeave(req, res, next) {
        try {
            const data = await attendanceService.rejectLeaveRequest(req.params.id, req.user.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getAbsences(req, res, next) {
        try {
            const data = await attendanceService.getTodayAbsences();
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getVacationBalance(req, res, next) {
        try {
            const employeeId = req.params.id || req.user.profile?.id;
            const data = await attendanceService.getVacationBalance(employeeId);
            res.json({ data });
        } catch (err) { next(err); }
    }
}

module.exports = new AttendanceController();
