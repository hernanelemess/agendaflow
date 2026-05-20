const Joi = require('joi');

const createSchema = Joi.object({
  professional_id: Joi.number().integer().positive().required(),
  service_id:      Joi.number().integer().positive().required(),
  starts_at:       Joi.date().iso().greater('now').required()
                     .messages({ 'date.greater': 'O agendamento deve ser para uma data futura.' }),
  notes:           Joi.string().max(500).allow('', null).optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'cancelled', 'completed').required(),
});

const availabilitySchema = Joi.object({
  professional_id: Joi.number().integer().positive().required(),
  service_id:      Joi.number().integer().positive().required(),
  date:            Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
                     .messages({ 'string.pattern.base': 'Formato esperado: YYYY-MM-DD' }),
});

module.exports = { createSchema, updateStatusSchema, availabilitySchema };