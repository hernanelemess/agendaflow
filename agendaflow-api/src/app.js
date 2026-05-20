require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const { errorHandler }  = require('./middlewares/errorHandler');
const { notFound }      = require('./middlewares/notFound');

const authRoutes          = require('./modules/auth/auth.routes');
const usersRoutes         = require('./modules/users/users.routes');
const establishmentsRoutes = require('./modules/establishments/establishments.routes');
const professionalsRoutes = require('./modules/professionals/professionals.routes');
const servicesRoutes      = require('./modules/services/services.routes');
const schedulesRoutes     = require('./modules/schedules/schedules.routes');
const appointmentsRoutes  = require('./modules/appointments/appointments.routes');
const adminRoutes         = require('./modules/admin/admin.routes');

const app = express();

// Segurança e parsing
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Rotas
app.use('/auth',           authRoutes);
app.use('/users',          usersRoutes);
app.use('/establishments', establishmentsRoutes);
app.use('/professionals',  professionalsRoutes);
app.use('/services',       servicesRoutes);
app.use('/schedules',      schedulesRoutes);
app.use('/appointments',   appointmentsRoutes);
app.use('/admin',          adminRoutes);

// Tratamento de erros (sempre por último)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
