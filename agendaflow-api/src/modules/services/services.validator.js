const Joi = require('joi');

const createSchema = Joi.object({
  establishment_id: Joi.number().integer().positive().required(),
  name:             Joi.string().min(2).max(120).required(),
  description:      Joi.string().max(500).allow('', null).optional(),
  duration_min:     Joi.number().integer().min(5).max(480).required(),
  price:            Joi.number().precision(2).min(0).required(),
});

const updateSchema = Joi.object({
  name:         Joi.string().min(2).max(120),
  description:  Joi.string().max(500).allow('', null),
  duration_min: Joi.number().integer().min(5).max(480),
  price:        Joi.number().precision(2).min(0),
  active:       Joi.boolean(),
}).min(1);

module.exports = { createSchema, updateSchema };