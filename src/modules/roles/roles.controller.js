const rolesService = require('./roles.service');

class RolesController {
    async getAll(req, res, next) {
        try {
            const roles = await rolesService.getAll();
            res.json({ data: roles });
        } catch (err) { next(err); }
    }

    async getById(req, res, next) {
        try {
            const role = await rolesService.getById(req.params.id);
            res.json({ data: role });
        } catch (err) { next(err); }
    }

    async create(req, res, next) {
        try {
            const role = await rolesService.create(req.validatedBody);
            res.status(201).json({ data: role });
        } catch (err) { next(err); }
    }

    async update(req, res, next) {
        try {
            const role = await rolesService.update(req.params.id, req.validatedBody);
            res.json({ data: role });
        } catch (err) { next(err); }
    }

    async remove(req, res, next) {
        try {
            const result = await rolesService.delete(req.params.id);
            res.json(result);
        } catch (err) { next(err); }
    }
}

module.exports = new RolesController();
