const Joi = require('joi');

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    bio: Joi.string().max(500).allow('').optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createGoal: Joi.object({
    text: Joi.string().min(5).max(200).required(),
  }),

  bulkCreateGoals: Joi.object({
    goals: Joi.array().items(
      Joi.string().min(5).max(200).required()
    ).min(1).max(50).required(),
  }),

  updateGoal: Joi.object({
    text: Joi.string().min(5).max(200).required(),
  }),

  createComment: Joi.object({
    goalId: Joi.string().uuid().required(),
    text: Joi.string().min(1).max(500).required(),
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    bio: Joi.string().max(500).allow('').optional(),
  }),
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ error: errorMessages });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

module.exports = { validate, schemas };
