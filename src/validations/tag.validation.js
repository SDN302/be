const Joi = require('joi');
const { objectId } = require('./custom.validation');

const colorSchema = Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

const createTag = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    color: colorSchema.required(),
  }),
};

const updateTag = {
  params: Joi.object().keys({
    tagId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      color: colorSchema,
    })
    .min(1),
};

const deleteTag = {
  params: Joi.object().keys({
    tagId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createTag,
  updateTag,
  deleteTag,
};
