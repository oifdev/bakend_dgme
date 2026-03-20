const dashboardService = require('./dashboard.service');

class DashboardController {
    async getStats(req, res, next) {
        try {
            const stats = await dashboardService.getStats();
            res.json({ data: stats });
        } catch (err) { next(err); }
    }
}

module.exports = new DashboardController();
