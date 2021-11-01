const Joi = require('joi');
const mongoose = require('mongoose');

const schemaAddContact = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  phone: Joi.string()
    .pattern(/^[(][0-9]{3}[)][\s][0-9]{3}[-][0-9]{4}$/, 'phone')
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .required(),
  favorite: Joi.boolean().optional(),
});

const schemaQueryContact = Joi.object({
  sortBy: Joi.string().valid('email', 'id', 'subscription').optional(),
  sortByDesc: Joi.string().valid('email', 'id', 'subscription').optional(),
  filter: Joi.string().valid().optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  offset: Joi.number().integer().min(0).optional(),
  favorite: Joi.boolean().optional(),
}).without('sortBy', 'sortByDesc');

const schemaUpdateContact = Joi.object({
  name: Joi.string().min(3).max(30).optional(),
  phone: Joi.string()
    .pattern(/^[(][0-9]{3}[)][\s][0-9]{3}[-][0-9]{4}$/, 'phone')
    .optional(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .optional(),
  favorite: Joi.boolean().optional(),
}).or('name', 'email', 'phone', 'favorite');

const schemaUpdateStatusContact = Joi.object({
  favorite: Joi.boolean().required(),
});

const validate = async (schema, obj, next) => {
  try {
    await schema.validateAsync(obj);
    return next();
  } catch (err) {
    console.log(err);
    next({ status: 400, message: err.message.replace(/"/g, "'") });
  }
};

module.exports = {
  addContact: async (req, res, next) => {
    return await validate(schemaAddContact, req.body, next);
  },
  queryContact: async (req, res, next) => {
    return await validate(schemaQueryContact, req.query, next);
  },
  updateContact: async (req, res, next) => {
    return await validate(schemaUpdateContact, req.body, next);
  },
  updateStatusContact: async (req, res, next) => {
    return await validate(schemaUpdateStatusContact, req.body, next);
  },
  objectId: async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.contactId)) {
      return await next({ status: 400, message: 'Indalid Object Id' });
    }
    next();
  },
};