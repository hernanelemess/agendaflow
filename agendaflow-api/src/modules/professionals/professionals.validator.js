const Joi = require('joi');

const createSchema = Joi.object({
  establishment_id: Joi.number().integer().positive().required(),
  name:             Joi.string().min(2).max(120).required(),
  bio:              Joi.string().max(500).allow('', null).optional(),
});

const updateSchema = Joi.object({
  name:   Joi.string().min(2).max(120),
  bio:    Joi.string().max(500).allow('', null),
  active: Joi.boolean(),
}).min(1);

module.exports = { createSchema, updateSchema };