const Joi = require('joi');

const createSchema = Joi.object({
  professional_id: Joi.number().integer().positive().required(),
  weekday:         Joi.number().integer().min(0).max(6).required(),
  start_time:      Joi.string().pattern(/^\d{2}:\d{2}$/).required()
                     .messages({ 'string.pattern.base': 'Formato esperado: HH:MM' }),
  end_time:        Joi.string().pattern(/^\d{2}:\d{2}$/).required()
                     .messages({ 'string.pattern.base': 'Formato esperado: HH:MM' }),
  label:           Joi.string().max(50).allow('', null).optional(),
});

module.exports = { createSchema };