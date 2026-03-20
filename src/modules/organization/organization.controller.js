const organizationService = require('./organization.service');

class OrganizationController {
    // Subdirections
    async getSubdirections(req, res, next) {
        try {
            const data = await organizationService.getAllSubdirections();
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getSubdirection(req, res, next) {
        try {
            const data = await organizationService.getSubdirectionById(req.params.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async createSubdirection(req, res, next) {
        try {
            const data = await organizationService.createSubdirection(req.validatedBody);
            res.status(201).json({ data });
        } catch (err) { next(err); }
    }

    async updateSubdirection(req, res, next) {
        try {
            const data = await organizationService.updateSubdirection(req.params.id, req.validatedBody);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async deleteSubdirection(req, res, next) {
        try {
            const result = await organizationService.deleteSubdirection(req.params.id);
            res.json(result);
        } catch (err) { next(err); }
    }

    // Units
    async getUnits(req, res, next) {
        try {
            const data = await organizationService.getAllUnits(req.query.subdirection_id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getUnit(req, res, next) {
        try {
            const data = await organizationService.getUnitById(req.params.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async createUnit(req, res, next) {
        try {
            const data = await organizationService.createUnit(req.validatedBody);
            res.status(201).json({ data });
        } catch (err) { next(err); }
    }

    async updateUnit(req, res, next) {
        try {
            const data = await organizationService.updateUnit(req.params.id, req.validatedBody);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async deleteUnit(req, res, next) {
        try {
            const result = await organizationService.deleteUnit(req.params.id);
            res.json(result);
        } catch (err) { next(err); }
    }

    // Positions
    async getPositions(req, res, next) {
        try {
            const data = await organizationService.getAllPositions();
            res.json({ data });
        } catch (err) { next(err); }
    }

    async createPosition(req, res, next) {
        try {
            const data = await organizationService.createPosition(req.validatedBody);
            res.status(201).json({ data });
        } catch (err) { next(err); }
    }

    async updatePosition(req, res, next) {
        try {
            const data = await organizationService.updatePosition(req.params.id, req.validatedBody);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async deletePosition(req, res, next) {
        try {
            const result = await organizationService.deletePosition(req.params.id);
            res.json(result);
        } catch (err) { next(err); }
    }

    // Org Chart
    async getOrgChart(req, res, next) {
        try {
            const data = await organizationService.getOrgChart();
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getOrgTree(req, res, next) {
        try {
            const data = await organizationService.getOrgTree();
            res.json({ data });
        } catch (err) { next(err); }
    }
}

module.exports = new OrganizationController();
