const permissionsService = require('./permissions.service');

class PermissionsController {
    async getAll(req, res, next) {
        try {
            const perms = await permissionsService.getAll({ module: req.query.module });
            res.json({ data: perms });
        } catch (err) { next(err); }
    }

    async getGrouped(req, res, next) {
        try {
            const grouped = await permissionsService.getGroupedByModule();
            res.json({ data: grouped });
        } catch (err) { next(err); }
    }

    async getById(req, res, next) {
        try {
            const perm = await permissionsService.getById(req.params.id);
            res.json({ data: perm });
        } catch (err) { next(err); }
    }

    async create(req, res, next) {
        try {
            const perm = await permissionsService.create(req.validatedBody);
            res.status(201).json({ data: perm });
        } catch (err) { next(err); }
    }

    async update(req, res, next) {
        try {
            const perm = await permissionsService.update(req.params.id, req.validatedBody);
            res.json({ data: perm });
        } catch (err) { next(err); }
    }

    async remove(req, res, next) {
        try {
            const result = await permissionsService.delete(req.params.id);
            res.json(result);
        } catch (err) { next(err); }
    }
}

module.exports = new PermissionsController();
