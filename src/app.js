require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const rolesRoutes = require('./modules/roles/roles.routes');
const permissionsRoutes = require('./modules/permissions/permissions.routes');
const organizationRoutes = require('./modules/organization/organization.routes');
const hrRoutes = require('./modules/hr/hr.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const auditRoutes = require('./modules/audit/audit.routes');

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/permissions', permissionsRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/hr', hrRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit', auditRoutes);

// 404 handler
app.get('/', (req, res) => {
    res.json({ message: 'DGME Backend funcionando correctamente' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use(errorHandler);


// Start server
const server = app.listen(config.port, '0.0.0.0', () => {
    console.log('Sevidor escuchando en el puerto http://localhost:' + config.port);
    console.log(`🚀 DGME Backend running on port ${config.port}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
});

module.exports = app;
