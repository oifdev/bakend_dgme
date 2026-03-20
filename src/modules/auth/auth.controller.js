const authService = require('./auth.service');

class AuthController {
    async login(req, res, next) {
        try {
            const { email, password } = req.validatedBody;
            const result = await authService.login(email, password);
            res.json({ data: result });
        } catch (err) {
            next(err);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const { refresh_token } = req.body;
            if (!refresh_token) {
                return res.status(400).json({ error: 'refresh_token requerido' });
            }
            const result = await authService.refreshToken(refresh_token);
            res.json({ data: result });
        } catch (err) {
            next(err);
        }
    }

    async logout(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            await authService.logout(token);
            res.json({ message: 'Sesión cerrada correctamente' });
        } catch (err) {
            next(err);
        }
    }

    async getProfile(req, res, next) {
        try {
            const profile = await authService.getProfile(req.user.id);
            if (!profile) {
                return res.status(404).json({ error: 'Perfil no encontrado' });
            }
            res.json({ data: profile });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
