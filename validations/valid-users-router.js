const Joi = require('joi');
const mongoose = require('mongoose');
const { Subscription } = require('../helper/constants');

const schemaSignUpUser = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .required(),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{6,18}$/, 'password')
    .required(),
  subscription: Joi.string().optional(),
});

const schemaLoginUser = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const schemaUpdateSubUser = Joi.object({
  subscription: Joi.string()
    .valid(Subscription.STARTER, Subscription.PRO, Subscription.BUSINESS)
    .required(),
});

const validate = async (schema, obj, next) => {
  try {
    await schema.validateAsync(obj);
    return next();
  } catch (err) {
    console.log(err);
    next({
      status: 400,
      message: 'Ошибка от Joi или другой библиотеки валидации',
    });
  }
};

module.exports = {
  addUser: async (req, res, next) => {
    return await validate(schemaSignUpUser, req.body, next);
  },
  loginUser: async (req, res, next) => {
    return await validate(schemaLoginUser, req.body, next);
  },
  updateSub: async (req, res, next) => {
    return await validate(schemaUpdateSubUser, req.body, next);
  },
};