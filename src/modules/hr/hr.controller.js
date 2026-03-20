const hrService = require('./hr.service');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

class HRController {
    get uploadMiddleware() {
        return upload.single('file');
    }

    async getEmployees(req, res, next) {
        try {
            const filters = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                search: req.query.search,
                subdirection_id: req.query.subdirection_id,
                unit_id: req.query.unit_id,
                status: req.query.status,
            };

            if (req.permissionScope?.type === 'subdirection') {
                filters.subdirection_id = req.permissionScope.subdirection_id;
            } else if (req.permissionScope?.type === 'unit') {
                filters.unit_id = req.permissionScope.unit_id;
            }

            const result = await hrService.getEmployees(filters);
            res.json({ data: result });
        } catch (err) { next(err); }
    }

    async getEmployee(req, res, next) {
        try {
            const data = await hrService.getEmployeeById(req.params.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async updateEmployee(req, res, next) {
        try {
            const data = await hrService.updateEmployee(req.params.id, req.body, req.user.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async updatePersonalInfo(req, res, next) {
        try {
            const data = await hrService.updatePersonalInfo(req.user.id, req.body);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getEmploymentHistory(req, res, next) {
        try {
            const data = await hrService.getEmploymentHistory(req.params.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getSalaryHistory(req, res, next) {
        try {
            const data = await hrService.getSalaryHistory(req.params.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async getDocuments(req, res, next) {
        try {
            const data = await hrService.getDocuments(req.params.id);
            res.json({ data });
        } catch (err) { next(err); }
    }

    async uploadDocument(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Archivo requerido' });
            }
            const data = await hrService.uploadDocument({
                employeeId: req.params.id,
                name: req.file.originalname,
                fileBuffer: req.file.buffer,
                mimeType: req.file.mimetype,
                uploadedBy: req.user.id,
            });
            res.status(201).json({ data });
        } catch (err) { next(err); }
    }

    async deleteDocument(req, res, next) {
        try {
            const result = await hrService.deleteDocument(req.params.docId);
            res.json(result);
        } catch (err) { next(err); }
    }

    async uploadPhoto(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Imagen requerida' });
            }
            const data = await hrService.uploadPhoto(req.params.id, req.file.buffer, req.file.mimetype);
            res.json({ data });
        } catch (err) { next(err); }
    }
}

module.exports = new HRController();
