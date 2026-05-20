const Joi = require('joi');

const createSchema = Joi.object({
  name:    Joi.string().min(2).max(120).required(),
  slug:    Joi.string().min(2).max(120).lowercase().pattern(/^[a-z0-9-]+$/).required()
             .messages({ 'string.pattern.base': 'Slug deve conter apenas letras minúsculas, números e hífens.' }),
  phone:   Joi.string().max(20).optional(),
  address: Joi.string().max(255).optional(),
});

const updateSchema = Joi.object({
  name:    Joi.string().min(2).max(120),
  phone:   Joi.string().max(20).allow('', null),
  address: Joi.string().max(255).allow('', null),
  active:  Joi.boolean(),
}).min(1);

module.exports = { createSchema, updateSchema };