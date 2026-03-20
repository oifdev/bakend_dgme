const auditService = require('./audit.service');

class AuditController {
    async getLogs(req, res, next) {
        try {
            const filters = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 30,
                user_id: req.query.user_id,
                action: req.query.action,
                entity_type: req.query.entity_type,
                start_date: req.query.start_date,
                end_date: req.query.end_date,
            };
            const data = await auditService.getLogs(filters);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getLog(req, res, next) {
        try {
            const data = await auditService.getLogById(req.params.id);
            res.json({ data });
        } catch (err) { next(err); }
    }
}

module.exports = new AuditController();
