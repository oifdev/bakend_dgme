const { Router } = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { loginSchema } = require('./auth.validation');

const router = Router();

/**
 * Rate limiter en memoria para el endpoint de login.
 * Máximo 10 intentos por IP cada 15 minutos.
 * Para producción multi-instancia, migrar a express-rate-limit + Redis.
 */
const loginAttempts = new Map();
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

const loginRateLimiter = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (record) {
        // Limpiar ventana expirada
        if (now - record.startTime > LOGIN_WINDOW_MS) {
            loginAttempts.set(ip, { count: 1, startTime: now });
            return next();
        }

        if (record.count >= LOGIN_LIMIT) {
            const retryAfterSecs = Math.ceil((LOGIN_WINDOW_MS - (now - record.startTime)) / 1000);
            res.set('Retry-After', String(retryAfterSecs));
            return res.status(429).json({
                error: 'Demasiados intentos de inicio de sesión. Intente de nuevo más tarde.',
                retryAfter: retryAfterSecs,
            });
        }

        record.count++;
    } else {
        loginAttempts.set(ip, { count: 1, startTime: now });
    }

    next();
};

router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
