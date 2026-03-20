const usersService = require('./users.service');

class UsersController {
    async getAll(req, res, next) {
        try {
            const { page, limit, search, subdirection_id, unit_id, status } = req.query;

            // Apply scope filtering
            const filters = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search,
                subdirection_id,
                unit_id,
                status,
            };

            // If scoped permission, restrict query
            if (req.permissionScope?.type === 'subdirection') {
                filters.subdirection_id = req.permissionScope.subdirection_id;
            } else if (req.permissionScope?.type === 'unit') {
                filters.unit_id = req.permissionScope.unit_id;
            }

            const result = await usersService.getAllUsers(filters);
            res.json({ data: result });
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const user = await usersService.getUserById(req.params.id);
            res.json({ data: user });
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const user = await usersService.createUser(req.validatedBody);
            res.status(201).json({ data: user });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const updateData = { ...req.validatedBody, _changed_by: req.user.id };
            const user = await usersService.updateUser(req.params.id, updateData);
            res.json({ data: user });
        } catch (err) {
            next(err);
        }
    }

    async remove(req, res, next) {
        try {
            const result = await usersService.deleteUser(req.params.id);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async toggleStatus(req, res, next) {
        try {
            const { active } = req.body;
            const result = await usersService.toggleUserStatus(req.params.id, active);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UsersController();
